const { execFileSync } = require('node:child_process')

function deterministicBuildId() {
  const supplied = process.env.PUMPKIN_BUILD_ID
  const buildId =
    supplied ||
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      encoding: 'utf8',
      windowsHide: true,
    }).trim()
  if (!/^[A-Za-z0-9._-]{7,64}$/.test(buildId)) {
    throw new Error('Admin build ID must be a stable 7-64 character release identifier.')
  }
  return buildId
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  generateBuildId: async () => deterministicBuildId(),
  poweredByHeader: false,
  transpilePackages: ['pumpkin-ts-models'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
