import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dockerfile chạy bản build standalone (.next/standalone/server.js)
  output: "standalone",
};

export default nextConfig;
