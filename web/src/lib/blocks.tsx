import type { ReactNode } from 'react';
import Image from 'next/image';

// A Journal article written in the admin is a list of blocks. Each block maps onto one of the
// Journal's existing styles, so a writer only chooses *what* something is (a heading, a pull
// quote, an ingredient list) and it is formatted exactly like the articles already on the site.
// Shared by the public article page and the editor's live preview.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'steps'; items: { title: string; text: string }[] }
  | { type: 'ingredients'; items: { name: string; detail: string }[] }
  | { type: 'image'; url: string; alt: string; caption?: string; width?: number; height?: number };

export type BlockType = Block['type'];

export const BLOCK_LABELS: Record<BlockType, string> = {
  p: 'Paragraph', h2: 'Heading', quote: 'Pull quote', list: 'List', steps: 'Numbered points', ingredients: 'Ingredients', image: 'Image',
};

export function emptyBlock(type: BlockType): Block {
  switch (type) {
    case 'p': return { type, text: '' };
    case 'h2': return { type, text: '' };
    case 'quote': return { type, text: '', cite: '' };
    case 'list': return { type, ordered: false, items: [''] };
    case 'steps': return { type, items: [{ title: '', text: '' }] };
    case 'ingredients': return { type, items: [{ name: '', detail: '' }] };
    case 'image': return { type, url: '', alt: '', caption: '' };
  }
}

/** Keeps only well-formed blocks with the expected fields (input from the editor is untrusted). */
export function cleanBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  const s = (v: unknown, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
  const out: Block[] = [];
  for (const b of input.slice(0, 300)) {
    if (!b || typeof b !== 'object') continue;
    const o = b as Record<string, unknown>;
    switch (o.type) {
      case 'p': case 'h2': out.push({ type: o.type, text: s(o.text) }); break;
      case 'quote': out.push({ type: 'quote', text: s(o.text), cite: s(o.cite, 200) }); break;
      case 'list': out.push({ type: 'list', ordered: !!o.ordered, items: (Array.isArray(o.items) ? o.items : []).slice(0, 60).map((x) => s(x, 1000)) }); break;
      case 'steps': out.push({ type: 'steps', items: (Array.isArray(o.items) ? o.items : []).slice(0, 30).map((x) => ({ title: s((x as Record<string, unknown>)?.title, 200), text: s((x as Record<string, unknown>)?.text, 2000) })) }); break;
      case 'ingredients': out.push({ type: 'ingredients', items: (Array.isArray(o.items) ? o.items : []).slice(0, 60).map((x) => ({ name: s((x as Record<string, unknown>)?.name, 120), detail: s((x as Record<string, unknown>)?.detail, 300) })) }); break;
      case 'image': {
        const url = s(o.url, 1000);
        if (/^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(url) || url.startsWith('/media/'))
          out.push({ type: 'image', url, alt: s(o.alt, 300), caption: s(o.caption, 300), width: Number(o.width) || undefined, height: Number(o.height) || undefined });
        break;
      }
    }
  }
  return out;
}

// Inline formatting a writer can type: *italic*, **bold**, and [a link](https://...).
// Parsed into React elements, never injected as HTML.
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/))/i;
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<b key={k++}>{m[1]}</b>);
    else if (m[2]) out.push(<i key={k++}>{m[2]}</i>);
    else if (m[3]) out.push(SAFE_HREF.test(m[4]) ? <a key={k++} href={m[4]} rel={m[4].startsWith('/') ? undefined : 'noopener'}>{m[3]}</a> : m[3]);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Renders blocks with the Journal's own markup and classes (see .jr-body in globals.css). */
export function renderBlocks(blocks: Block[]): ReactNode {
  return blocks.map((b, i) => {
    switch (b.type) {
      case 'p': return b.text.trim() ? <p key={i}>{inline(b.text)}</p> : null;
      case 'h2': return b.text.trim() ? <h2 key={i}>{b.text}</h2> : null;
      case 'quote': return b.text.trim() ? (
        <blockquote key={i}><p>{inline(b.text)}</p>{b.cite?.trim() && <cite>{b.cite}</cite>}</blockquote>
      ) : null;
      case 'list': {
        const items = b.items.filter((x) => x.trim());
        if (!items.length) return null;
        const L = b.ordered ? 'ol' : 'ul';
        return <L key={i} className="jr-list">{items.map((x, k) => <li key={k}>{inline(x)}</li>)}</L>;
      }
      case 'steps': {
        const items = b.items.filter((x) => x.title.trim() || x.text.trim());
        return items.length ? (
          <ol key={i} className="jr-steps">{items.map((x, k) => <li key={k}><h2>{x.title}</h2><p>{inline(x.text)}</p></li>)}</ol>
        ) : null;
      }
      case 'ingredients': {
        const items = b.items.filter((x) => x.name.trim());
        return items.length ? (
          <dl key={i} className="jr-ingredients">{items.map((x, k) => <div key={k}><dt>{x.name}</dt><dd>{x.detail}</dd></div>)}</dl>
        ) : null;
      }
      case 'image': return b.url ? (
        <figure key={i} className="jr-figure jr-figure-wide">
          <Image src={b.url} width={b.width || 1600} height={b.height || 1000} sizes="(min-width: 760px) 640px, 92vw" alt={b.alt} />
          {b.caption?.trim() && <figcaption>{b.caption}</figcaption>}
        </figure>
      ) : null;
    }
  });
}

export function blocksText(blocks: Block[]) {
  return blocks.map((b) => {
    switch (b.type) {
      case 'p': case 'h2': return b.text;
      case 'quote': return `${b.text} ${b.cite ?? ''}`;
      case 'list': return b.items.join(' ');
      case 'steps': return b.items.map((x) => `${x.title} ${x.text}`).join(' ');
      case 'ingredients': return b.items.map((x) => `${x.name} ${x.detail}`).join(' ');
      case 'image': return b.caption ?? '';
    }
  }).join(' ');
}

export const readingMinutes = (blocks: Block[], dek = '') =>
  Math.max(1, Math.round(`${dek} ${blocksText(blocks)}`.split(/\s+/).filter(Boolean).length / 200));

// AVVVS publishes no medical claims. The editor flags wording that tends to become one, so a
// writer can rephrase before publishing. It advises; it does not block.
const CLAIMS: [RegExp, string][] = [
  [/\bcur(e|es|ed|ing|ative)\b/i, 'Says it cures something'],
  [/\bheal(s|ed|ing)?\b/i, 'Says it heals'],
  [/\b(guarantee[sd]?|guaranteed)\b/i, 'Promises a result'],
  [/\b(no|zero|free of|without( any)?) side[- ]?effects?\b|\bside[- ]?effect[- ]free\b/i, 'Claims no side effects'],
  [/\b100\s?%\s?(natural|safe|herbal|effective)\b/i, 'Absolute claim'],
  [/\b(clinically )?proven\b/i, 'Claims proof'],
  [/\bmiracle\b|\bmagic(al)?\b/i, 'Miracle wording'],
  [/\bpain[- ]free\b|\binstant relief\b|\bpermanent(ly)?\b/i, 'Promises relief'],
  [/\b(remedy|treatment|treats?) for\b/i, 'Presents it as a treatment'],
  [/\b(prevents?|reverses?|eliminates?)\b/i, 'Health outcome'],
  [/\b(best|number one|no\.?\s?1)\b/i, 'Unprovable superlative'],
];

export interface ClaimHit { block: number; word: string; why: string }

export function checkClaims(blocks: Block[], extra: { title?: string; dek?: string } = {}): ClaimHit[] {
  const hits: ClaimHit[] = [];
  const scan = (text: string, block: number) => {
    for (const [re, why] of CLAIMS) {
      const m = text.match(re);
      if (m) hits.push({ block, word: m[0], why });
    }
  };
  scan(`${extra.title ?? ''} ${extra.dek ?? ''}`, -1);
  blocks.forEach((b, i) => scan(blocksText([b]), i));
  return hits;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
