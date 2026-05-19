const path = require('path');

const isStaticRenderMode = process.env.PUMPKIN_RENDER_MODE === 'static';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['pumpkin-ts-models', 'pumpkin-block-views'],
  ...(isStaticRenderMode
    ? {
        output: 'export',
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
  webpack: (config) => {
    config.resolve.alias['pumpkin-block-views'] = path.resolve(
      __dirname,
      '../../packages/pumpkin-block-views/src'
    );
    return config;
  },
};

module.exports = nextConfig;
