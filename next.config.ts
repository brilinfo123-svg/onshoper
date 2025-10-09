import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // ✅ Add this line for Cloudinary support
  },
  async headers() {
    return [
      {
        source: "/_next/static/css/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        timers: false,
        'timers/promises': false,
        child_process: false,
        'fs/promises': false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
      };

      config.externals = [
        ...(config.externals || []),
        { 'connect-mongodb-session': 'commonjs connect-mongodb-session' },
        { mongodb: 'commonjs mongodb' },
        { mongoose: 'commonjs mongoose' },
      ];
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },
};

export default nextConfig;
