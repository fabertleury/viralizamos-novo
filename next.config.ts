/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.viralizamos.com', 'cnquhqmqxibpnioullsm.supabase.co', 'ijpwrspomqdnxavpjbzh.supabase.co'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['www.viralizamos.com', 'viralizamos.com', 'localhost:3000'],
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
