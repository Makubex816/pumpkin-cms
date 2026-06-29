/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['pumpkin-ts-models'],
}

module.exports = nextConfig
