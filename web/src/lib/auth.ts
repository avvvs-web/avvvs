import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql, ensureSchema, hasDatabase } from './db';

// Named accounts for the Journal admin. Passwords are hashed with scrypt; a session is a random
// token in an httpOnly cookie, stored only as its SHA-256 hash, so a database leak exposes no
// usable sessions. Sessions last 14 days and can be revoked by disabling the account.

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = 'avvvs_admin';
const DAYS = 14;

export type Role = 'admin' | 'writer';
export interface User { id: number; email: string; name: string; role: Role }

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, s, k] = stored.split('$');
  if (alg !== 'scrypt' || !s || !k) return false;
  const want = Buffer.from(k, 'base64');
  const got = await scrypt(pw, Buffer.from(s, 'base64'), want.length);
  return got.length === want.length && timingSafeEqual(got, want);
}

export const PASSWORD_MIN = 10;
export const passwordProblem = (pw: string) =>
  pw.length < PASSWORD_MIN ? `Use at least ${PASSWORD_MIN} characters.` : pw.length > 200 ? 'That password is too long.' : null;

const tokenHash = (t: string) => createHash('sha256').update(t).digest('hex');

export async function createSession(userId: number) {
  await ensureSchema();
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + DAYS * 864e5);
  await sql()`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (${tokenHash(token)}, ${userId}, ${expires.toISOString()})`;
  await sql()`DELETE FROM sessions WHERE expires_at < now()`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && hasDatabase()) await sql()`DELETE FROM sessions WHERE token_hash = ${tokenHash(token)}`;
  jar.delete(COOKIE);
}

/** The signed-in user, or null. Disabled accounts and expired sessions count as signed out. */
export async function currentUser(): Promise<User | null> {
  if (!hasDatabase()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  await ensureSchema();
  const rows = await sql()`
    SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash(token)} AND s.expires_at > now() AND NOT u.disabled`;
  return (rows[0] as User | undefined) ?? null;
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect('/admin/login');
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'admin') redirect('/admin');
  return u;
}

export async function userCount() {
  await ensureSchema();
  const r = await sql()`SELECT count(*)::int AS n FROM users`;
  return (r[0] as { n: number }).n;
}

// Best-effort brake on password guessing: a few attempts per minute per address and per email.
const attempts = new Map<string, number[]>();
export function tooManyAttempts(key: string) {
  const now = Date.now();
  const list = (attempts.get(key) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  attempts.set(key, list);
  return list.length > 6;
}
