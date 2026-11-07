import { ogImage, OG_SIZE } from '@/lib/og';

export const alt = 'Arya Vaidya Vilasini Vaidya Sala, Ayurveda in Kozhikode since 1921';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ still: 'media/film/stills/k00.jpg', kicker: 'Kozhikode · since 1921', title: 'Ayurveda medicines, made to standard for over a century' });
}
