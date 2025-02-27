/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Disable static generation completely
  output: 'standalone',
  // Set all pages to be server-side rendered
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'pbel-volleyball.vercel.app'],
    },
    // Disable static optimization completely
    isrMemoryCacheSize: 0,
    serverComponentsExternalPackages: ['*'],
  },
  // Force all pages to be server-side rendered
  staticPageGenerationTimeout: 1,
  // Add dynamic export to force dynamic rendering
  env: {
    NEXT_DISABLE_STATIC_GENERATION: 'true',
  },
  // Disable static optimization
  compiler: {
    styledComponents: true,
  },
  // Disable static page generation
  generateEtags: false,
  poweredByHeader: false,
  trailingSlash: false,
}

module.exports = nextConfig