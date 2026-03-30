import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'registration.ieeevbitsb.in',
      },
      {
        protocol: 'https',
        hostname: 'avishkar2k25.ieeevbitsb.in',
      },
      {
        protocol: 'https',
        hostname: 'qtpdzikpgfgrpowesgkp.supabase.co',
      },
    ],
  },
};

export default nextConfig;
