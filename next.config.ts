import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
   trailingSlash: true,

  images: {
    unoptimized: true, // 🔥 REQUIRED for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;