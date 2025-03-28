/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.viralizamos.com', 'cnquhqmqxibpnioullsm.supabase.co'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['www.viralizamos.com', 'localhost:3000'],
    },
  },
};

module.exports = nextConfig;
