// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',  
        destination: `${process.env.API_SERVER_URL}/:path*`,  // Proxy to your desired destination
      },
    ];
  },
};

export default nextConfig;