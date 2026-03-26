/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@vibespace/schema', '@vibespace/scene-runtime'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
