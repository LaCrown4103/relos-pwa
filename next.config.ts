import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
