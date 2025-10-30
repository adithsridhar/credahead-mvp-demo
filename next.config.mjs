/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        // Apply cache headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-App-Version',
            value: `v${Date.now()}`,
          },
        ],
      },
      {
        // Special cache control for dynamic pages
        source: '/(dashboard|auth|assessment)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // API routes get shorter cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig;