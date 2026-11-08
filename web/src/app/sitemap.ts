import type { MetadataRoute } from 'next';
import { abs } from '@/lib/site';
import { allPosts } from '@/lib/posts-db';

export const revalidate = 3600;

const withLang = (e: MetadataRoute.Sitemap[number]) => ({ ...e, alternates: { languages: { 'en-IN': e.url, 'x-default': e.url } } });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const POSTS = await allPosts();
  const now = new Date();
  return ([
    { url: abs('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: abs('/manufacturing'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: abs('/our-history'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: abs('/community'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: abs('/journal'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...POSTS.map((p) => ({ url: abs(`/journal/${p.slug}`), lastModified: new Date(p.revised), changeFrequency: 'yearly' as const, priority: 0.5 })),
    { url: abs('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ] as MetadataRoute.Sitemap).map(withLang);
}
