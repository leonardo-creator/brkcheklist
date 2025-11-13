import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
      {
        protocol: 'https',
        hostname: 'graph.microsoft.com', // OneDrive thumbnails
      },
      {
        protocol: 'https',
        hostname: '**.sharepoint.com', // OneDrive share links
      },
      {
        protocol: 'https',
        hostname: 'onedrive.live.com', // OneDrive public links
      },
      {
        protocol: 'https',
        hostname: '1drv.ms', // OneDrive short links
      },
    ],
  },

  // PWA Configuration
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
