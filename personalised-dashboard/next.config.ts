import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all external images during development, but you should restrict this in production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      }
    ],
    // Alternative: Use domains array for simpler configuration (deprecated but still works)
    // domains: ['*'], // This would allow all domains but is deprecated
    
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
