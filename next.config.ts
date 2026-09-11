import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cleanDistDir: true,
  turbopack: { root: import.meta.dirname },
  typedRoutes: true,
  reactCompiler: true,

  experimental: {
    cpus: 1,
    typedEnv: true,
  } as NextConfig["experimental"],
};

export default nextConfig;
