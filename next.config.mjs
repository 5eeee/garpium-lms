import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "lms.garpium.com",
        "www.lms.garpium.com"
      ]
    }
  }
};

export default nextConfig;
