import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  output: "standalone",
  // Inlined at build time so every deployed bundle knows exactly which release it is.
  env: { APP_VERSION: pkg.version },
};

export default nextConfig;
