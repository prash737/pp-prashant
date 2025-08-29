/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: [
    'pathpiper.com',
    'localhost:3000',
    '*.replit.dev',
    '2374dc7d-99ed-4276-9293-296b01bb20f1-00-1zgzx53ybd3pv.sisko.replit.dev'
  ],
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  images: {
    domains: ['localhost', 'pathpiper.com'],
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@/components', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
    turbo: {
      rules: {
        '*.tsx': ['swc-loader'],
        '*.ts': ['swc-loader']
      }
    },
    swcPlugins: []
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig