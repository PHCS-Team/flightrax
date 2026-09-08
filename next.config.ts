import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
