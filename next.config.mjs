/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure we can import from outside app directory if needed, though src structure avoids this
  experimental: {
    // serverActions: true, // Enabled by default in newer versions
  },
  async rewrites() {
    // Em produção via Docker, BACKEND_URL deve ser 'http://api:3001'
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('Using backend URL for rewrites:', backendUrl);

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
