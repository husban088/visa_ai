import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add your own photo host here if it isn't already covered.
    // These three cover Cloudinary uploads, Unsplash, and Wikimedia Commons —
    // the most common sources for a country's `heroImageUrl` in src/lib/countries.ts.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
};

export default nextConfig;
