import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica
  reactStrictMode: true,
  
  // Configuración de imágenes para Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
