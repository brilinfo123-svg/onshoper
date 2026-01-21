import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Cloudinary images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Global headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(self), microphone=(), camera=(), payment=()",
          },
        ],
      },
      {
        source: "/_next/static/css/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Webpack fallbacks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        timers: false,
        "timers/promises": false,
        child_process: false,
        "fs/promises": false,
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer"),
        util: require.resolve("util"),
        url: require.resolve("url"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify"),
        path: require.resolve("path-browserify"),
        zlib: require.resolve("browserify-zlib"),
      };

      config.externals = [
        ...(config.externals || []),
        { "connect-mongodb-session": "commonjs connect-mongodb-session" },
        { mongodb: "commonjs mongodb" },
        { mongoose: "commonjs mongoose" },
      ];
    }

    return config;
  },

  serverExternalPackages: ["mongoose", "mongodb"],
};

// -------------------------
// 🚀 Wrap with PWA
// -------------------------
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);













// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com", // Cloudinary support
//       },
//     ],
//   },
//   async headers() {
//     return [
//       {
//         source: "/_next/static/css/(.*)",
//         headers: [
//           { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
//         ],
//       },
//     ];
//   },
//   webpack: (config, { isServer }) => {
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         dns: false,
//         net: false,
//         tls: false,
//         timers: false,
//         'timers/promises': false,
//         child_process: false,
//         'fs/promises': false,
//         stream: require.resolve('stream-browserify'),
//         crypto: require.resolve('crypto-browserify'),
//         buffer: require.resolve('buffer'),
//         util: require.resolve('util'),
//         url: require.resolve('url'),
//         assert: require.resolve('assert'),
//         http: require.resolve('stream-http'),
//         https: require.resolve('https-browserify'),
//         os: require.resolve('os-browserify'),
//         path: require.resolve('path-browserify'),
//         zlib: require.resolve('browserify-zlib'),
//       };

//       config.externals = [
//         ...(config.externals || []),
//         { 'connect-mongodb-session': 'commonjs connect-mongodb-session' },
//         { mongodb: 'commonjs mongodb' },
//         { mongoose: 'commonjs mongoose' },
//       ];
//     }

//     return config;
//   },
//   serverExternalPackages: ["mongoose", "mongodb"],
// };

// export default nextConfig;
