import "@WorkSphere/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
