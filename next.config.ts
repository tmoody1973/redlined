import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile map rendering packages for ESM compatibility
  transpilePackages: ["mapbox-gl", "react-map-gl"],
};

export default nextConfig;
