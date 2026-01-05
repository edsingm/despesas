/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure we can import from outside app directory if needed, though src structure avoids this
  experimental: {
    // serverActions: true, // Enabled by default in newer versions
  },
};

export default nextConfig;
