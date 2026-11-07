'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'node:crypto';
import { sql, ensureSchema } from '@/lib/db';
import {
  createSession, endSession, hashPassword, verifyPassword, passwordProblem, requireUser, requireAdmin,
  tooManyAttempts, userCount, currentUser,
} from '@/lib/auth';
import { cleanBlocks, slugify } from '@/lib/blocks';
import { KINDS, builtInSlugs, type DbPost } from '@/lib/posts-db';
import type { Kind } from '@/lib/journal';

export interface FormState { error?: string; ok?: string }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (f: FormData, k: string, max = 300) => String(f.get(k) ?? '').trim().slice(0, max);
const clientIp = async () => (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';

// ---------- signing in ----------

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, 'email').toLowerCase();
  const password = String(f.get('password') ?? '');
  if (tooManyAttempts(`ip:${await clientIp()}`) || tooManyAttempts(`email:${email}`)) return { error: 'Too many attempts. Wait a minute and try again.' };
  await ensureSchema();
  const rows = await sql()`SELECT id, password_hash, disabled FROM users WHERE email = ${email} LIMIT 1`;
  const u = rows[0] as { id: number; password_hash: string; disabled: boolean } | undefined;
  // the same message either way, so the form does not reveal which emails have accounts
  if (!u || u.disabled || !(await verifyPassword(password, u.password_hash))) return { error: 'That email and password do not match an active account.' };
  await createSession(u.id);
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

/** The first account. Only works while there are no users, and only with the setup key from Vercel. */
export async function setup(_: FormState, f: FormData): Promise<FormState> {
  const key = process.env.ADMIN_SETUP_KEY;
  if (!key || key.length < 16) return { error: 'Set ADMIN_SETUP_KEY (16+ characters) in the Vercel project first.' };
  if (tooManyAttempts(`setup:${await clientIp()}`)) return { error: 'Too many attempts. Wait a minute.' };
  if ((await userCount()) > 0) return { error: 'An admin already exists. Sign in instead.' };
  if (str(f, 'key', 500) !== key) return { error: 'The setup key is not right.' };
  const name = str(f, 'name', 100), email = str(f, 'email').toLowerCase(), password = String(f.get('password') ?? '');
  if (!name) return { error: 'Add your name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Add a valid email.' };
  const bad = passwordProblem(password);
  if (bad) return { error: bad };
  const r = await sql()`INSERT INTO users (email, name, password_hash, role) VALUES (${email}, ${name}, ${await hashPassword(password)}, 'admin') RETURNING id`;
  await createSession((r[0] as { id: number }).id);
  redirect('/admin');
}

// ---------- accounts ----------

export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = String(f.get('current') ?? ''), next = String(f.get('next') ?? '');
  const row = (await sql()`SELECT password_hash FROM users WHERE id = ${me.id}`)[0] as { password_hash: string };
  if (!(await verifyPassword(current, row.password_hash))) return { error: 'Your current password is not right.' };
  const bad = passwordProblem(next);
  if (bad) return { error: bad };
  await sql()`UPDATE users SET password_hash = ${await hashPassword(next)} WHERE id = ${me.id}`;
  return { ok: 'Password changed.' };
}

export async function addUser(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(f, 'name', 100), email = str(f, 'email').toLowerCase();
  const role = f.get('role') === 'admin' ? 'admin' : 'writer';
  if (!name) return { error: 'Add a name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Add a valid email.' };
  const temp = randomBytes(9).toString('base64url');
  try {
    await sql()`INSERT INTO users (email, name, password_hash, role) VALUES (${email}, ${name}, ${await hashPassword(temp)}, ${role})`;
  } catch {
    return { error: 'That email already has an account.' };
  }
  revalidatePath('/admin/users');
  return { ok: `Account created for ${name}. Their temporary password is ${temp}. Share it privately; they can change it under Account.` };
}

export async function resetPassword(id: number): Promise<FormState> {
  await requireAdmin();
  const temp = randomBytes(9).toString('base64url');
  await sql()`UPDATE users SET password_hash = ${await hashPassword(temp)} WHERE id = ${id}`;
  await sql()`DELETE FROM sessions WHERE user_id = ${id}`;
  return { ok: `New temporary password: ${temp}` };
}

export async function setDisabled(id: number, disabled: boolean): Promise<FormState> {
  const me = await requireAdmin();
  if (id === me.id) return { error: 'You cannot disable your own account.' };
  await sql()`UPDATE users SET disabled = ${disabled} WHERE id = ${id}`;
  if (disabled) await sql()`DELETE FROM sessions WHERE user_id = ${id}`;
  revalidatePath('/admin/users');
  return { ok: disabled ? 'Account disabled.' : 'Account enabled.' };
}

// ---------- articles ----------

async function canEdit(postId: number) {
  const me = await requireUser();
  const row = (await sql()`SELECT author_id, slug FROM posts WHERE id = ${postId}`)[0] as { author_id: number | null; slug: string } | undefined;
  if (!row) return { me, row: null, allowed: false };
  return { me, row, allowed: me.role === 'admin' || row.author_id === me.id };
}

export async function newPost() {
  const me = await requireUser();
  await ensureSchema();
  const slug = `draft-${randomBytes(4).toString('hex')}`;
  const r = await sql()`INSERT INTO posts (slug, title, author_id) VALUES (${slug}, 'Untitled article', ${me.id}) RETURNING id`;
  redirect(`/admin/posts/${(r[0] as { id: number }).id}`);
}

export interface PostInput {
  title: string; slug: string; dek: string; kind: Kind; formulation: boolean;
  cover: { url: string; alt: string; width?: number; height?: number } | null;
  body: unknown;
}

export async function savePost(id: number, input: PostInput, publish: 'keep' | 'publish' | 'unpublish'): Promise<FormState & { slug?: string; status?: string }> {
  const { allowed, row } = await canEdit(id);
  if (!allowed || !row) return { error: 'You cannot edit this article.' };

  const title = String(input.title ?? '').trim().slice(0, 160);
  const dek = String(input.dek ?? '').trim().slice(0, 400);
  const kind: Kind = KINDS.includes(input.kind) ? input.kind : 'Heritage';
  const slug = slugify(String(input.slug || title));
  const body = cleanBlocks(input.body);
  const coverUrl = input.cover?.url && /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(input.cover.url) ? input.cover.url : null;

  if (!title) return { error: 'Give the article a title.' };
  if (!slug) return { error: 'The web address needs at least one letter or number.' };
  if (builtInSlugs().has(slug)) return { error: 'That web address belongs to one of the built-in articles. Choose another.' };
  const clash = await sql()`SELECT 1 FROM posts WHERE slug = ${slug} AND id <> ${id} LIMIT 1`;
  if (clash.length) return { error: 'Another article already uses that web address.' };
  if (publish === 'publish') {
    if (!dek) return { error: 'Add a short summary before publishing.' };
    if (!body.some((b) => b.type === 'p' && b.text.trim())) return { error: 'Add at least one paragraph before publishing.' };
    if (coverUrl && !input.cover?.alt?.trim()) return { error: 'Describe the cover image (alt text) before publishing.' };
  }

  const status = publish === 'publish' ? 'published' : publish === 'unpublish' ? 'draft' : null;
  const rows = await sql()`
    UPDATE posts SET
      title = ${title}, slug = ${slug}, dek = ${dek}, kind = ${kind}, formulation = ${!!input.formulation},
      cover_url = ${coverUrl}, cover_alt = ${String(input.cover?.alt ?? '').slice(0, 300)},
      cover_width = ${coverUrl ? Number(input.cover?.width) || null : null}, cover_height = ${coverUrl ? Number(input.cover?.height) || null : null},
      body = ${JSON.stringify(body)}::jsonb,
      status = COALESCE(${status}::text, status),
      published_at = CASE WHEN ${status}::text = 'published' AND published_at IS NULL THEN now() ELSE published_at END,
      updated_at = now()
    WHERE id = ${id} RETURNING status`;
  const saved = (rows[0] as { status: string }).status;

  revalidatePath('/journal');
  revalidatePath(`/journal/${slug}`);
  if (row.slug !== slug) revalidatePath(`/journal/${row.slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');
  return { ok: saved === 'published' ? (publish === 'publish' ? 'Published.' : 'Saved. The live article is updated.') : publish === 'unpublish' ? 'Unpublished. It is a draft again.' : 'Draft saved.', slug, status: saved };
}

export async function deletePost(id: number): Promise<FormState> {
  const { allowed, row } = await canEdit(id);
  if (!allowed || !row) return { error: 'You cannot delete this article.' };
  await sql()`DELETE FROM posts WHERE id = ${id}`;
  revalidatePath('/journal');
  revalidatePath(`/journal/${row.slug}`);
  revalidatePath('/admin');
  redirect('/admin');
}

export async function whoAmI() {
  return currentUser();
}

export type { DbPost };
