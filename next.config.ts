import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['jennie-linux.tail2268a1.ts.net'],
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
