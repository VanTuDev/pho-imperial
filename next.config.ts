import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async redirects() {
    // Physical QR codes in the restaurant point at `/table/<n>` (and a few
    // variants). Route them all to the real order page so old prints keep working.
    return [
      { source: "/table/:code", destination: "/order?table=:code", permanent: false },
      { source: "/tables/:code", destination: "/order?table=:code", permanent: false },
      { source: "/ban/:code", destination: "/order?table=:code", permanent: false },
      { source: "/t/:code", destination: "/order?table=:code", permanent: false },
      { source: "/qr/:code", destination: "/order?table=:code", permanent: false },
    ];
  },
};

export default nextConfig;
