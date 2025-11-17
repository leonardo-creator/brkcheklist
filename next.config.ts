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
        hostname: '**.blob.core.windows.net', // Azure Storage blobs
      },
    ],
  },

  // PWA Configuration
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Mark optional storage dependencies as externals for server builds
    // This prevents webpack from trying to bundle them, allowing dynamic imports at runtime
    if (isServer) {
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        ({ request }, callback) => {
          // Check if the request is one of our optional dependencies
          if (['aws-sdk', '@azure/storage-blob', 'form-data'].includes(request)) {
            // Mark as external - webpack won't try to bundle it
            // The dynamic import in the code will handle loading it at runtime
            return callback(undefined, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }

    return config;
  },
};

export default nextConfig;
