import type { MetadataRoute } from 'next';
import { abs } from '@/lib/site';

// Search engines and AI answer engines are all welcome: being quoted accurately by ChatGPT,
// Claude, Perplexity and Google's AI answers is part of the point (GEO). Only the mail endpoint is off limits.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: '/api/' },
    ],
    sitemap: abs('/sitemap.xml'),
    host: abs('/'),
  };
}
