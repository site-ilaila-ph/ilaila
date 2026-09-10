import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: false,
  cleanDistDir: true,
  turbopack: { root: import.meta.dirname },
  watchOptions: {
    pollIntervalMs: 20
  },
  typedRoutes: true
};

export default nextConfig;