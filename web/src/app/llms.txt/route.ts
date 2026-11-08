import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL } from '@/lib/site';

// llms.txt, the plain-text summary for AI answer engines. Written against https://avvvs.com in
// src/content/llms.txt; served with the deployment's real address, like the canonical links.
export const dynamic = 'force-static';

export function GET() {
  const text = readFileSync(join(process.cwd(), 'src/content/llms.txt'), 'utf8').replaceAll('https://avvvs.com', SITE_URL);
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
