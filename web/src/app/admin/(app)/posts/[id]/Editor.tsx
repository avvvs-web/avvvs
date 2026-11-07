'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import {
  BLOCK_LABELS, emptyBlock, renderBlocks, checkClaims, readingMinutes, slugify,
  type Block, type BlockType,
} from '@/lib/blocks';
import type { Kind } from '@/lib/journal';
import { savePost, deletePost, type PostInput } from '../../../actions';

type Cover = NonNullable<PostInput['cover']>;
interface Draft { title: string; slug: string; dek: string; kind: Kind; formulation: boolean; cover: Cover | null; body: Block[] }

const ADD: BlockType[] = ['p', 'h2', 'quote', 'list', 'steps', 'ingredients', 'image'];

/** Resize to at most 2000px on the long side and upload; returns the stored image's URL and size. */
async function uploadImage(file: File): Promise<{ url: string; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale), height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not read that image.'))), 'image/jpeg', 0.86));
  const form = new FormData();
  form.append('file', new File([blob], 'image.jpg', { type: 'image/jpeg' }));
  const r = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Upload failed.');
  return { url: j.url, width, height };
}

function AutoText({ value, onChange, placeholder, big, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; big?: boolean; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`; } }, [value]);
  return <textarea ref={ref} className={big ? 'ed-text ed-text-big' : 'ed-text'} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function ImagePicker({ onPicked, label }: { onPicked: (r: { url: string; width: number; height: number }) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <label className="ed-upload">
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true); setErr('');
          try { onPicked(await uploadImage(f)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
        }} />
      <span className="link-btn">{busy ? 'Uploading…' : label}</span>
      {err && <span className="ad-note ad-note-error">{err}</span>}
    </label>
  );
}

function BlockEditor({ b, set }: { b: Block; set: (b: Block) => void }) {
  switch (b.type) {
    case 'p': return <AutoText value={b.text} onChange={(text) => set({ ...b, text })} rows={3} placeholder="Write a paragraph. *italic*, **bold** and [a link](https://…) work here." />;
    case 'h2': return <input className="ed-input ed-input-h" value={b.text} onChange={(e) => set({ ...b, text: e.target.value })} placeholder="Section heading" />;
    case 'quote': return (
      <>
        <AutoText big value={b.text} onChange={(text) => set({ ...b, text })} placeholder="The quotation" />
        <input className="ed-input" value={b.cite ?? ''} onChange={(e) => set({ ...b, cite: e.target.value })} placeholder="Who said it (optional)" />
      </>
    );
    case 'list': return (
      <>
        <label className="ed-check"><input type="checkbox" checked={b.ordered} onChange={(e) => set({ ...b, ordered: e.target.checked })} /> Numbered</label>
        {b.items.map((it, k) => (
          <div className="ed-row" key={k}>
            <input className="ed-input" value={it} placeholder={`Item ${k + 1}`} onChange={(e) => set({ ...b, items: b.items.map((x, j) => (j === k ? e.target.value : x)) })} />
            <button type="button" className="ed-x" aria-label="Remove item" onClick={() => set({ ...b, items: b.items.filter((_, j) => j !== k) })}>×</button>
          </div>
        ))}
        <button type="button" className="link-btn" onClick={() => set({ ...b, items: [...b.items, ''] })}>Add item</button>
      </>
    );
    case 'steps': return (
      <>
        {b.items.map((it, k) => (
          <div className="ed-pair" key={k}>
            <input className="ed-input ed-input-strong" value={it.title} placeholder={`Point ${k + 1}: a short heading`} onChange={(e) => set({ ...b, items: b.items.map((x, j) => (j === k ? { ...x, title: e.target.value } : x)) })} />
            <AutoText value={it.text} placeholder="What it means" onChange={(text) => set({ ...b, items: b.items.map((x, j) => (j === k ? { ...x, text } : x)) })} />
            <button type="button" className="ed-x" aria-label="Remove point" onClick={() => set({ ...b, items: b.items.filter((_, j) => j !== k) })}>×</button>
          </div>
        ))}
        <button type="button" className="link-btn" onClick={() => set({ ...b, items: [...b.items, { title: '', text: '' }] })}>Add point</button>
      </>
    );
    case 'ingredients': return (
      <>
        {b.items.map((it, k) => (
          <div className="ed-row" key={k}>
            <input className="ed-input ed-input-strong" value={it.name} placeholder="Name (e.g. Karpura)" onChange={(e) => set({ ...b, items: b.items.map((x, j) => (j === k ? { ...x, name: e.target.value } : x)) })} />
            <input className="ed-input" value={it.detail} placeholder="What it is (e.g. Camphor, Cinnamomum camphora)" onChange={(e) => set({ ...b, items: b.items.map((x, j) => (j === k ? { ...x, detail: e.target.value } : x)) })} />
            <button type="button" className="ed-x" aria-label="Remove ingredient" onClick={() => set({ ...b, items: b.items.filter((_, j) => j !== k) })}>×</button>
          </div>
        ))}
        <button type="button" className="link-btn" onClick={() => set({ ...b, items: [...b.items, { name: '', detail: '' }] })}>Add ingredient</button>
      </>
    );
    case 'image': return (
      <>
        {b.url ? (
          <Image src={b.url} width={b.width || 1600} height={b.height || 1000} alt="" className="ed-thumb" />
        ) : null}
        <ImagePicker label={b.url ? 'Replace image' : 'Upload an image'} onPicked={(r) => set({ ...b, ...r })} />
        <input className="ed-input" value={b.alt} onChange={(e) => set({ ...b, alt: e.target.value })} placeholder="Describe the image for people who can't see it (required)" />
        <input className="ed-input" value={b.caption ?? ''} onChange={(e) => set({ ...b, caption: e.target.value })} placeholder="Caption (optional)" />
      </>
    );
  }
}

export function Editor({ id, initial, status: startStatus, kinds, author }: { id: number; initial: Draft; status: string; kinds: Kind[]; author: string }) {
  const [d, setD] = useState<Draft>(initial.body.length ? initial : { ...initial, body: [emptyBlock('p')] });
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [status, setStatus] = useState(startStatus);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const up = (patch: Partial<Draft>) => { setD((x) => ({ ...x, ...patch })); setDirty(true); };
  const slug = slugTouched ? d.slug : slugify(d.title);
  const claims = useMemo(() => checkClaims(d.body, { title: d.title, dek: d.dek }), [d.body, d.title, d.dek]);
  const minutes = readingMinutes(d.body, d.dek);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setBlock = (i: number, b: Block) => up({ body: d.body.map((x, j) => (j === i ? b : x)) });
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= d.body.length) return;
    const body = [...d.body];
    [body[i], body[j]] = [body[j], body[i]];
    up({ body });
  };
  const insert = (i: number, type: BlockType) => up({ body: [...d.body.slice(0, i), emptyBlock(type), ...d.body.slice(i)] });

  const save = (mode: 'keep' | 'publish' | 'unpublish') => start(async () => {
    setMsg({});
    const r = await savePost(id, { ...d, slug }, mode);
    if (r.error) { setMsg({ error: r.error }); return; }
    setMsg({ ok: r.ok });
    if (r.status) setStatus(r.status);
    if (r.slug) { setD((x) => ({ ...x, slug: r.slug! })); setSlugTouched(true); }
    setDirty(false);
  });

  return (
    <div className="ed">
      <div className="ed-toolbar">
        <div className="ed-state">
          <span className={`ad-pill ad-pill-${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
          <span className="ad-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div className="ed-tabs" role="tablist" aria-label="View">
          <button role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>Write</button>
          <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button>
        </div>
        <div className="ed-actions">
          <button type="button" className="btn btn-quiet" disabled={pending} onClick={() => save('keep')}>{status === 'published' ? 'Save changes' : 'Save draft'}</button>
          {status === 'published'
            ? <button type="button" className="btn btn-quiet" disabled={pending} onClick={() => { if (confirm('Take this article off the Journal? It becomes a draft again.')) save('unpublish'); }}>Unpublish</button>
            : <button type="button" className="btn" disabled={pending} onClick={() => save('publish')}>Publish</button>}
        </div>
      </div>
      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'} ed-msg`} role="status">{msg.error || msg.ok}{status === 'published' && msg.ok && <> <a href={`/journal/${slug}`} target="_blank" rel="noopener">View it ↗</a></>}</p>}

      <div className={`ed-split is-${tab}`}>
        <section className="ed-write" aria-label="Write">
          <div className="ed-meta">
            <AutoText big value={d.title} onChange={(title) => up({ title })} placeholder="Title" rows={1} />
            <AutoText value={d.dek} onChange={(dek) => up({ dek })} placeholder="One or two sentences that sum the article up. Shown under the title and in search results." />
            <div className="ed-meta-row">
              <label className="ad-field"><span>Section</span>
                <select value={d.kind} onChange={(e) => up({ kind: e.target.value as Kind })}>{kinds.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="ad-field ed-slug"><span>Web address</span>
                <span className="ed-slug-box">/journal/<input value={slug} onChange={(e) => { setSlugTouched(true); up({ slug: slugify(e.target.value) || e.target.value.toLowerCase() }); }} placeholder="from-the-title" /></span>
              </label>
            </div>
            <label className="ed-check"><input type="checkbox" checked={d.formulation} onChange={(e) => up({ formulation: e.target.checked })} /> This article describes an AVVVS medicine (adds the &ldquo;see a practitioner&rdquo; note and a shop link)</label>
            <div className="ed-cover">
              <span className="ad-field-label">Cover image</span>
              {d.cover && <Image src={d.cover.url} width={d.cover.width || 1600} height={d.cover.height || 1000} alt="" className="ed-thumb" />}
              <ImagePicker label={d.cover ? 'Replace cover' : 'Upload a cover image (wide works best)'} onPicked={(r) => up({ cover: { ...r, alt: d.cover?.alt ?? '' } })} />
              {d.cover && (
                <>
                  <input className="ed-input" value={d.cover.alt} onChange={(e) => up({ cover: { ...d.cover!, alt: e.target.value } })} placeholder="Describe the cover image (required)" />
                  <button type="button" className="link-btn" onClick={() => up({ cover: null })}>Remove cover</button>
                </>
              )}
              {!d.cover && <p className="ad-muted">Without one, the article uses the gold-thread still from the film.</p>}
            </div>
          </div>

          <ol className="ed-blocks">
            {d.body.map((b, i) => (
              <li key={i} className={`ed-block ed-block-${b.type}`}>
                <div className="ed-block-head">
                  <span>{BLOCK_LABELS[b.type]}</span>
                  <span className="ed-block-tools">
                    <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                    <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === d.body.length - 1}>↓</button>
                    <button type="button" aria-label="Delete block" onClick={() => up({ body: d.body.filter((_, j) => j !== i) })}>Delete</button>
                  </span>
                </div>
                <BlockEditor b={b} set={(nb) => setBlock(i, nb)} />
                {claims.filter((c) => c.block === i).map((c, k) => (
                  <p key={k} className="ed-claim">&ldquo;{c.word}&rdquo;: {c.why}. AVVVS makes no medical claims; consider rewording.</p>
                ))}
                <div className="ed-insert" aria-label="Add a block here">
                  {ADD.map((t) => <button type="button" key={t} onClick={() => insert(i + 1, t)}>+ {BLOCK_LABELS[t]}</button>)}
                </div>
              </li>
            ))}
          </ol>
          {d.body.length === 0 && (
            <div className="ed-insert ed-insert-open">{ADD.map((t) => <button type="button" key={t} onClick={() => insert(0, t)}>+ {BLOCK_LABELS[t]}</button>)}</div>
          )}

          <aside className="ed-check-panel" aria-label="Before you publish">
            <h2>Before you publish</h2>
            {claims.length === 0
              ? <p className="ad-muted">No claim wording found. Read it once more for anything that promises a health result.</p>
              : <ul>{claims.map((c, k) => <li key={k}><b>&ldquo;{c.word}&rdquo;</b> {c.block < 0 ? 'in the title or summary' : `in block ${c.block + 1}`}: {c.why}.</li>)}</ul>}
            <p className="ad-muted">About {minutes} min read · by {author}</p>
          </aside>

          <form className="ed-danger" action={() => { if (confirm('Delete this article for good? This cannot be undone.')) start(async () => { await deletePost(id); }); }}>
            <button className="link-btn">Delete this article</button>
          </form>
        </section>

        <section className="ed-preview" aria-label="Preview">
          <div className="ed-preview-label">Preview: exactly how it appears on the Journal</div>
          <div className="jr jr-post ed-preview-page">
            <header className="jr-head">
              <p className="jr-meta"><span>Journal / {d.kind}</span></p>
              <h1>{d.title || 'Title'}</h1>
              <p className="jr-standfirst">{d.dek || 'The summary appears here.'}</p>
              <p className="jr-meta"><span>{minutes} min read</span></p>
            </header>
            {d.cover && (
              <figure className="jr-cover">
                <Image src={d.cover.url} width={d.cover.width || 1600} height={d.cover.height || 1000} alt={d.cover.alt} sizes="640px" />
              </figure>
            )}
            <div className="jr-body">
              {renderBlocks(d.body)}
              {d.formulation && (
                <aside className="jr-note"><p className="jr-note-h">A note on this medicine</p><p>This piece describes an AVVVS formulation; it is not medical advice. Use Ayurvedic medicines under the guidance of a qualified practitioner…</p></aside>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
