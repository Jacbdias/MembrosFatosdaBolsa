/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ Configurações experimentais para resolver problemas de build
  experimental: {
    forceSwcTransforms: true,
  },
  
  // CONFIGURAÇÕES ADICIONADAS PARA A API FINANCEIRA:
  images: {
    domains: [
      'raw.githubusercontent.com',
      'brapi.dev',
    ],
  },
  
  async headers() {
    return [
      {
        source: '/api/financial/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // ✅ Adicionar headers para todas as API routes
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
