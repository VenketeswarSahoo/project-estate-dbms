import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "development-files-store.s3.ca-central-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
