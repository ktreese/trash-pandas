import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from Vercel Blob storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Local blob dev server
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;
