import { notFound, redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { cleanBlocks } from '@/lib/blocks';
import { KINDS, type DbPost } from '@/lib/posts-db';
import { Editor } from './Editor';

export const metadata = { title: 'Edit article' };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const p = (await sql()`SELECT * FROM posts WHERE id = ${id}`)[0] as DbPost | undefined;
  if (!p) notFound();
  if (me.role !== 'admin' && p.author_id !== me.id) redirect('/admin');
  return (
    <Editor
      id={p.id}
      kinds={KINDS}
      initial={{
        title: p.title === 'Untitled article' ? '' : p.title,
        slug: p.slug.startsWith('draft-') ? '' : p.slug,
        dek: p.dek, kind: p.kind, formulation: p.formulation,
        cover: p.cover_url ? { url: p.cover_url, alt: p.cover_alt, width: p.cover_width ?? undefined, height: p.cover_height ?? undefined } : null,
        body: cleanBlocks(p.body),
      }}
      status={p.status}
      author={me.name}
    />
  );
}
