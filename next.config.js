/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rondorjwptmquhpjnfje.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pymuowzbfwsmxgufyogc.supabase.co',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        http: false,
        https: false,
        zlib: false,
        async_hooks: false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  typescript: {
    // Temporarily allow production builds to successfully complete even if type errors are present
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
