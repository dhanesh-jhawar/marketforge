/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@marketforge/shared', 'three'],
  images: {
    domains: ['images.unsplash.com', 'assets.marketforge.dev'],
  },
};

export default nextConfig;
