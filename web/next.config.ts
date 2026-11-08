import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// The dev server writes to .next-dev and production builds to .next, so running `next build`
// while `next dev` is up can't swap out the chunks the dev server is serving
// (that caused "Cannot find module './105.js'").
export default function config(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // the CSR page was first published as Social service
    async redirects() { return [{ source: '/social-service', destination: '/community', permanent: true }]; },
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
