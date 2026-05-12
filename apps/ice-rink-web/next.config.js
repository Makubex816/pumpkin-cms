const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['pumpkin-ts-models', 'pumpkin-block-views'],
  webpack: (config) => {
    config.resolve.alias['pumpkin-block-views'] = path.resolve(
      __dirname,
      '../../packages/pumpkin-block-views/src'
    );
    return config;
  },
};

module.exports = nextConfig;
