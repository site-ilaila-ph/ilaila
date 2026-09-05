import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: false,
  cleanDistDir: true,
  turbopack: { root: import.meta.dirname }
};

export default nextConfig;