import type { MetadataRoute } from 'next';
import { ORG } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${ORG.name} (${ORG.short})`,
    short_name: ORG.short,
    description: ORG.description,
    start_url: '/',
    display: 'browser',
    background_color: '#F4EFE5',
    theme_color: '#F4EFE5',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}
