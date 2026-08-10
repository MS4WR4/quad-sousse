import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2_592_000,
    qualities: [75, 85, 92, 100],
  },
};

export default nextConfig;
