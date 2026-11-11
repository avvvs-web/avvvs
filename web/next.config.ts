import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// The dev server writes to .next-dev and production builds to .next, so running `next build`
// while `next dev` is up can't swap out the chunks the dev server is serving
// (that caused "Cannot find module './105.js'").
// The site's public address, fixed at build time. NEXT_PUBLIC_SITE_URL wins when set (set it to the
// final domain, e.g. https://avvvs.com, once DNS points here); otherwise Vercel's production domain
// for the project. Canonical tags, hreflang, the sitemap, robots, share cards and structured data
// all follow it, so they always name the address this deployment actually serves.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://avvvs.com');

export default function config(phase: string): NextConfig {
  return {
    env: { NEXT_PUBLIC_SITE_URL: SITE_URL, NEXT_PUBLIC_DEPLOY_ENV: process.env.VERCEL_ENV || 'local' },
    reactStrictMode: true,
    // the CSR page was first published as Social service
    async redirects() { return [{ source: '/social-service', destination: '/community', permanent: true }]; },
    // The film's frames never change under the same address (the folder is versioned: see
    // film/encode_frames.sh), so browsers may keep them for a year without asking again.
    async headers() {
      return [{ source: '/media/film/v3/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
    },
    images: {
      // AVIF first (about half the weight of JPEG), WebP as the fallback
      formats: ['image/avif', 'image/webp'],
      // Journal images uploaded in the admin live in Vercel Blob
      remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    },
    // the stylesheet is inlined into each page's HTML, so it no longer blocks the first paint
    experimental: { inlineCss: true },
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  };
}
