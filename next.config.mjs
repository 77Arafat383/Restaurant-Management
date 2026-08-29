/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack disk caching in dev mode to prevent cache collisions & locking errors on Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
