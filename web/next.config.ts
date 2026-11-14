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

// Security headers for every page. The content policy names the only outside hosts the site talks
// to: Google Analytics and the Meta Pixel (both load only after consent, see Analytics.tsx) and
// Vercel Blob (Journal images). Next's own inline scripts and the inlined stylesheet need
// 'unsafe-inline'; the dev server also needs eval and its websocket, and Vercel previews their toolbar.
function securityHeaders(dev: boolean) {
  const preview = process.env.VERCEL_ENV === 'preview';
  const live = preview ? ' https://vercel.live' : '';
  const google = 'https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com';
  const meta = 'https://connect.facebook.net https://www.facebook.com';
  const blob = 'https://*.public.blob.vercel-storage.com';
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${dev ? ` 'unsafe-eval'` : ''} https://*.googletagmanager.com https://connect.facebook.net${live}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${blob} ${google} ${meta}`,
    `media-src 'self' blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${google} ${meta} ${blob} https://vercel.com${dev ? ' ws:' : ''}${live}`,
    `worker-src 'self' blob:`,
    `frame-src 'self'${live}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ');
  return [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    // this host only: shop. and clinic. are separate sites with their own settings
    { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  ];
}

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    env: { NEXT_PUBLIC_SITE_URL: SITE_URL, NEXT_PUBLIC_DEPLOY_ENV: process.env.VERCEL_ENV || 'local' },
    reactStrictMode: true,
    // the CSR page was first published as Social service
    async redirects() { return [{ source: '/social-service', destination: '/community', permanent: true }]; },
    // The film's frames never change under the same address (the folder is versioned: see
    // film/encode_frames.sh), so browsers may keep them for a year without asking again.
    async headers() {
      return [
        { source: '/:path*', headers: securityHeaders(dev) },
        { source: '/media/film/v3/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      ];
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
