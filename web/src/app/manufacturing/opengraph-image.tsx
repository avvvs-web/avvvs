import { ogImage, OG_SIZE } from '@/lib/og';

export const alt = 'AVVVS Manufacturing: third-party and white-label Ayurveda manufacturing';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ still: 'media/film/stills/k10.jpg', kicker: 'AVVVS Manufacturing', title: 'Your Ayurveda products, made in our GMP-certified factory' });
}
