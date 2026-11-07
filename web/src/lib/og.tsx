import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Social cards (Open Graph / X), rendered once at build time: a film still, the Since 1921 lockup
// on an ivory chip, and the page's line.
export const OG_SIZE = { width: 1200, height: 630 };

const pub = (p: string) => join(process.cwd(), 'public', p);
const dataUrl = (p: string, type: string) => `data:${type};base64,${readFileSync(pub(p)).toString('base64')}`;

export async function ogImage({ still, kicker, title }: { still: string; kicker: string; title: string }) {
  // a Journal cover uploaded in the admin is a Blob URL; everything else is a file in public/
  const src = still.startsWith('https://')
    ? await fetch(still).then(async (r) => `data:${r.headers.get('content-type') || 'image/jpeg'};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`)
    : dataUrl(still, 'image/jpeg');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0D0B09' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={1200} height={675} alt="" style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 675, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(13,11,9,0.88) 0%, rgba(13,11,9,0.55) 55%, rgba(13,11,9,0.1) 100%)' }} />
        <div style={{ position: 'absolute', left: 64, top: 56, display: 'flex', background: '#F4EFE5', borderRadius: 10, padding: '14px 18px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl('brand/avvvs-since-1921.svg', 'image/svg+xml')} width={271} height={60} alt="" />
        </div>
        <div style={{ position: 'absolute', left: 64, right: 220, bottom: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#E2C68E', marginBottom: 18 }}>{kicker}</div>
          <div style={{ display: 'flex', fontSize: 62, lineHeight: 1.08, color: '#F4EFE5', fontWeight: 600 }}>{title}</div>
          <div style={{ display: 'flex', width: 120, height: 3, background: '#C3A46A', marginTop: 28 }} />
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
