import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Neon Postgres, added to the Vercel project from the Marketplace (it sets DATABASE_URL).
// Without it the site still runs: the Journal shows its built-in articles and the admin says
// what to connect.

let client: NeonQueryFunction<false, false> | null = null;

export const hasDatabase = () => !!process.env.DATABASE_URL;

export function sql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set. Add Neon Postgres to the Vercel project.');
  client ??= neon(process.env.DATABASE_URL);
  return client;
}

let ready: Promise<void> | null = null;

/** Creates the tables on first use, so a new database needs no separate migration step. */
export function ensureSchema() {
  ready ??= (async () => {
    const q = sql();
    await q`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'writer' CHECK (role IN ('admin', 'writer')),
      disabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await q`CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    )`;
    await q`CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      dek TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT 'Heritage',
      cover_url TEXT,
      cover_alt TEXT NOT NULL DEFAULT '',
      cover_width INTEGER,
      cover_height INTEGER,
      body JSONB NOT NULL DEFAULT '[]'::jsonb,
      formulation BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  })().catch((e) => { ready = null; throw e; });
  return ready;
}
