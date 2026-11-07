import { sql, ensureSchema, hasDatabase } from './db';
import { cleanBlocks, readingMinutes, renderBlocks, type Block } from './blocks';
import { POSTS as BUILT_IN, type Post, type Kind } from './journal';

// Articles written in the admin, stored in Postgres, and merged with the built-in Journal.

export const KINDS: Kind[] = ['Heritage', 'Guidance', 'Formulations', 'Clinic'];

export interface DbPost {
  id: number; slug: string; title: string; dek: string; kind: Kind;
  cover_url: string | null; cover_alt: string; cover_width: number | null; cover_height: number | null;
  body: Block[]; formulation: boolean; status: 'draft' | 'published';
  author_id: number | null; author_name?: string | null;
  published_at: string | null; created_at: string; updated_at: string;
}

const FALLBACK_COVER = { src: '/media/film/stills/k13.jpg', width: 1920, height: 1080 };

export function toPost(d: DbPost): Post {
  const blocks = cleanBlocks(d.body);
  return {
    slug: d.slug,
    title: d.title,
    dek: d.dek,
    kind: KINDS.includes(d.kind) ? d.kind : 'Heritage',
    published: (d.published_at ?? d.created_at).slice(0, 10),
    revised: d.updated_at.slice(0, 10),
    minutes: readingMinutes(blocks, d.dek),
    cover: d.cover_url
      ? { src: d.cover_url, width: d.cover_width || 1600, height: d.cover_height || 1000, alt: d.cover_alt }
      : { ...FALLBACK_COVER, alt: 'A single gold thread drawn across ivory paper.' },
    formulation: d.formulation,
    body: renderBlocks(blocks),
  };
}

export async function publishedDbPosts(): Promise<Post[]> {
  if (!hasDatabase()) return [];
  try {
    await ensureSchema();
    const rows = await sql()`SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST, id DESC`;
    return (rows as DbPost[]).map(toPost);
  } catch (e) {
    console.error('[journal] could not read posts', e);
    return [];
  }
}

/** Every published article: the newest written in the admin first, then the built-in ones. */
export async function allPosts(): Promise<Post[]> {
  const db = await publishedDbPosts();
  const taken = new Set(db.map((p) => p.slug));
  return [...db, ...BUILT_IN.filter((p) => !taken.has(p.slug))];
}

export async function findPost(slug: string): Promise<Post | undefined> {
  if (hasDatabase()) {
    try {
      await ensureSchema();
      const rows = await sql()`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`;
      if (rows[0]) return toPost(rows[0] as DbPost);
    } catch (e) { console.error('[journal] could not read post', e); }
  }
  return BUILT_IN.find((p) => p.slug === slug);
}

export const builtInSlugs = () => new Set(BUILT_IN.map((p) => p.slug));
