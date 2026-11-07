import { ogImage, OG_SIZE } from '@/lib/og';

export const alt = 'The AVVVS Journal: notes from a century of Ayurveda in Kozhikode';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ still: 'media/film/stills/k06.jpg', kicker: 'Journal', title: 'Notes from a century of Ayurveda in Kozhikode' });
}
