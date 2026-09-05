import type { NextConfig } from 'next';

import { MEDIA_DEVICE_SIZES, MEDIA_IMAGE_SIZES } from './lib/media-sizes';

const nextConfig: NextConfig = {
  images: {
    // Cloudflare /cdn-cgi/image via image-loader.ts (skips Vercel Image Optimization).
    loader: 'custom',
    loaderFile: './image-loader.ts',
    // Keep in sync with lib/media-sizes.ts presets used by MediaImage call sites.
    deviceSizes: [...MEDIA_DEVICE_SIZES],
    imageSizes: [...MEDIA_IMAGE_SIZES],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.aestheticclinics.my',
        pathname: '/**',
      },
      // Legacy hosts kept during backfill (resolveMediaUrl fallback)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.aestheticclinics.my',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Bundle analyzer configuration
  ...(process.env.ANALYZE === 'true' && {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: (config: any) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
        enabled: true,
      });
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
  // Advanced webpack configuration for better code splitting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Split dashboard-specific chunks
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Dashboard-specific chunk
          dashboard: {
            name: 'dashboard',
            test: /[\\/]components[\\/]dashboard[\\/]|[\\/]app[\\/]\(dashboard\)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          // Heavy dependencies chunk
          heavyDeps: {
            name: 'heavy-deps',
            test: /[\\/]node_modules[\\/](@tanstack|@tiptap|cmdk|react-moveable)[\\/]/,
            chunks: 'all',
            priority: 15,
          },
          // Editor chunk
          editor: {
            name: 'editor',
            test: /[\\/]components[\\/]editor[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
