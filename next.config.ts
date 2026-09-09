import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: false,
  cleanDistDir: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  turbopack: { root: import.meta.dirname }
};

export default nextConfig;