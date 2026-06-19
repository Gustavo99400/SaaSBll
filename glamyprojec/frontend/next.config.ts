/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['169.254.53.114', 'localhost:3001'],
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG || '',
  },
};

export default nextConfig;
