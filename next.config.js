/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Include data files in the serverless bundle for Vercel
    outputFileTracingIncludes: {
      '/api/**': ['./data/**'],
    },
  },
};

module.exports = nextConfig;
