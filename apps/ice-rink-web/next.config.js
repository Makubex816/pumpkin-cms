const path = require('path');

const isStaticRenderMode = process.env.PUMPKIN_RENDER_MODE === 'static';
const isProduction = process.env.NODE_ENV === 'production';
const isMediaProxyEnabled =
  !isStaticRenderMode && (!isProduction || process.env.PUMPKIN_MEDIA_PROXY_ENABLED === 'true');

function getPumpkinApiUrl() {
  const rawUrl =
    process.env.PUMPKIN_API_URL ||
    process.env.NEXT_PUBLIC_PUMPKIN_API_URL ||
    'http://localhost:5064';

  try {
    const url = new URL(rawUrl);
    url.username = '';
    url.password = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return 'http://localhost:5064';
  }
}

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
  async rewrites() {
    const previewRewrites = [
      {
        source: '/__preview/ice-rink-rentals/home',
        destination: '/draft-preview/ice-rink-rentals/home',
      },
      {
        source: '/__preview/ice-rink-rentals/service-areas',
        destination: '/draft-preview/ice-rink-rentals/service-areas',
      },
    ];

    if (!isMediaProxyEnabled) return previewRewrites;

    const pumpkinApiUrl = getPumpkinApiUrl();
    return [
      ...previewRewrites,
      {
        source: '/media/ice-rink-rentals/:path*',
        destination: `${pumpkinApiUrl}/media/ice-rink-rentals/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias['pumpkin-block-views'] = path.resolve(
      __dirname,
      '../../packages/pumpkin-block-views/src'
    );
    return config;
  },
};

module.exports = nextConfig;
