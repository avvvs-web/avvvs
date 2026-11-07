import { ogImage, OG_SIZE } from '@/lib/og';

export const alt = 'Our history: Arya Vaidya Vilasini Vaidya Sala since 1921';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ still: 'media/film/stills/k05.jpg', kicker: 'Our history', title: 'One family, three generations, since 1921' });
}
