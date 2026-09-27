import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Tree-shake icon and animation imports instead of pulling in whole barrels.
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

export default nextConfig
