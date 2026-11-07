import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const mark = readFileSync(join(process.cwd(), 'public/brand/avvvs-mark.svg')).toString('base64');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4EFE5' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${mark}`} width={150} height={72} alt="" />
      </div>
    ),
    size,
  );
}
