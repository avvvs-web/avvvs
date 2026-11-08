import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Same split as web/: the dev server writes to .next-dev so a build can't swap its chunks.
export default function config(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'cdn.shopify.com' },
        { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      ],
    },
    experimental: { serverActions: { bodySizeLimit: '12mb' } },
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  };
}
