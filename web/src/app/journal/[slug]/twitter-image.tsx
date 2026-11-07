import { ogImage, OG_SIZE } from '@/lib/og';
import { POSTS, getPost } from '@/lib/journal';

export const alt = 'An article from the AVVVS Journal';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug)!;
  return ogImage({ still: p.cover.src.replace(/^\//, ''), kicker: `Journal · ${p.kind}`, title: p.title });
}
