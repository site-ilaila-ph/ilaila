import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cleanDistDir: true,
  turbopack: { root: import.meta.dirname },
  typedRoutes: true,
  experimental: {
    cpus: 1,
    reactCompiler: true,
    typedEnv: true,
  } as NextConfig['experimental']
};

export default nextConfig;