/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    forceSwcTransforms: true,
  },
  
  images: {
    domains: [
      'raw.githubusercontent.com',
      'brapi.dev',
    ],
  },
  
  async headers() {
    return [
      // 🔥 REMOVER CACHE DAS APIs FINANCEIRAS
      {
        source: '/api/financial/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate', // 👈 SEM CACHE!
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}
module.exports = nextConfig;