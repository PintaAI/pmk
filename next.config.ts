import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['jennie-linux.tail2268a1.ts.net'],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    proxyClientMaxBodySize: "4mb",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
