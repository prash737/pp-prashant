/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: [
    'pathpiper.com',
    'localhost:3000'
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
  // Deployment optimizations
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/**/.cache/**',
      'node_modules/**/test/**',
      'node_modules/**/tests/**',
      'node_modules/**/*.md',
    ],
  },
  // Prevent static generation timeout
  staticPageGenerationTimeout: 60,
  // Disable static optimization for problematic pages
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Webpack optimizations for faster builds
  webpack: (config, { isServer, webpack, nextRuntime }) => {
    // Special handling for Edge Runtime (middleware)
    if (nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        buffer: false,
        util: false,
        assert: false,
        events: false,
        path: false,
        os: false,
      };
      
      // Exclude problematic packages from Edge Runtime
      config.externals = config.externals || [];
      config.externals.push({
        '@supabase/supabase-js': 'commonjs @supabase/supabase-js',
        'crypto': 'commonjs crypto',
        'stream': 'commonjs stream',
        'buffer': 'commonjs buffer',
      });
      
      return config;
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      // Fix for 'self is not defined' error on server
      config.resolve.fallback = {
        ...config.resolve.fallback,
        self: false,
      };
    }
    
    // Reduce bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
}

export default nextConfig