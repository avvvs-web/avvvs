import { ogImage, OG_SIZE } from '@/lib/og';

export const alt = 'Community: the founding idea of AVVVS';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ still: 'media/history/school-talk-1.jpg', kicker: 'Community', title: 'The founding idea of AVVVS, since 1921' });
}
