import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { POSTS } from '@/lib/journal';
import { formatDate } from '@/lib/journal';
import { newPost } from '../actions';
import type { DbPost } from '@/lib/posts-db';

export const metadata = { title: 'Articles' };

export default async function Articles() {
  const me = await requireUser();
  await ensureSchema();
  const rows = (await sql()`
    SELECT p.*, u.name AS author_name FROM posts p LEFT JOIN users u ON u.id = p.author_id
    ORDER BY p.updated_at DESC`) as DbPost[];
  const mine = (p: DbPost) => me.role === 'admin' || p.author_id === me.id;

  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Articles</h1>
          <p className="ad-muted">Write a new article, or open one to edit it. Published articles appear on the Journal straight away.</p>
        </div>
        <form action={newPost}><button className="btn">New article</button></form>
      </div>

      {rows.length === 0 ? (
        <p className="ad-empty">No articles written here yet. The eight built-in Journal articles are listed below.</p>
      ) : (
        <table className="ad-table">
          <thead><tr><th>Title</th><th>Status</th><th>Author</th><th>Updated</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.title}</b><span className="ad-muted ad-slug">/journal/{p.slug}</span></td>
                <td><span className={`ad-pill ad-pill-${p.status}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span></td>
                <td>{p.author_name ?? '—'}</td>
                <td>{formatDate(String(p.updated_at).slice(0, 10))}</td>
                <td className="ad-row-actions">
                  {mine(p) && <Link href={`/admin/posts/${p.id}`}>Edit</Link>}
                  {p.status === 'published' && <a href={`/journal/${p.slug}`} target="_blank" rel="noopener">View ↗</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="ad-builtin">
        <h2>Built into the site</h2>
        <p className="ad-muted">These eight articles are part of the site&rsquo;s code, so they are edited by a developer rather than here.</p>
        <ul>{POSTS.map((p) => <li key={p.slug}><a href={`/journal/${p.slug}`} target="_blank" rel="noopener">{p.title}</a> <span className="ad-muted">· {p.kind}</span></li>)}</ul>
      </section>
    </div>
  );
}
