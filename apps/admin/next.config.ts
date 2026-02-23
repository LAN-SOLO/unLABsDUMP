import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Expose env vars to Edge Runtime (middleware)
  env: {
    DEV_AREA_ENABLED: process.env.DEV_AREA_ENABLED,
    DEV_AREA_MASTER_WALLET: process.env.DEV_AREA_MASTER_WALLET,
  },
}

export default nextConfig
