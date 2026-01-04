/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure we can import from outside app directory if needed, though src structure avoids this
  experimental: {
    // serverActions: true, // Enabled by default in newer versions
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Express backend
      },
    ];
  },
};

export default nextConfig;
