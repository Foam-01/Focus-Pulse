/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Perf: enable modern image formats and allow the remote image hosts already
  // referenced in the codebase (e.g. Unsplash poster images), so next/image
  // is ready to use without changing any existing <img> usage in this pass.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // A-2: Add Cache-Control headers for static video and image assets
  async headers() {
    return [
      {
        // Video files — 1 year immutable (versioned by ?v=xxx query string)
        source: '/Vdo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Image assets in /images/ folder
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // favicon — shorter TTL since it can change
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
