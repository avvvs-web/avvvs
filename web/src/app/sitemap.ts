import type { MetadataRoute } from 'next';
import { abs } from '@/lib/site';
import { POSTS } from '@/lib/journal';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: abs('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: abs('/manufacturing'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: abs('/our-history'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: abs('/journal'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...POSTS.map((p) => ({ url: abs(`/journal/${p.slug}`), lastModified: new Date(p.revised), changeFrequency: 'yearly' as const, priority: 0.5 })),
    { url: abs('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
