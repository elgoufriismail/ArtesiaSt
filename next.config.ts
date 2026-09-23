import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Stand-ins are pre-sized by tools/standins; served as static files with explicit srcset.
  images: { unoptimized: true },
};

export default nextConfig;
