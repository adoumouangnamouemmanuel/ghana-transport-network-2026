import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack/webpack conflict — canvas is browser-only (force-graph)
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;
