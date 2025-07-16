/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: [
    '74f7eb31-b1cd-42e1-bc33-49105efe81c2-00-2sp4lhr2dgh9s.sisko.replit.dev',
    'localhost:3000'
  ],
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  images: {
    domains: ['localhost', '74f7eb31-b1cd-42e1-bc33-49105efe81c2-00-2sp4lhr2dgh9s.sisko.replit.dev'],
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig