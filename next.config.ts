import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on the local network to access the dev server
  experimental: {
    allowedDevOrigins: ['10.158.158.111', 'localhost'],
  },
};

export default nextConfig;
