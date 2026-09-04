import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  generateEtags: true,
};

export default nextConfig;
