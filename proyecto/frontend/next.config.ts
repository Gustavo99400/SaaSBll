/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['169.254.53.114', 'localhost:3001'],
  env: {
    FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG || '',
  },
  /* tus otras configuraciones si existen */
};

export default nextConfig;
