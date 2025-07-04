/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'unsplash.com',
      'vaijrrodmzvbluytlnmw.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vaijrrodmzvbluytlnmw.supabase.co', // Add this pattern
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  }
}

module.exports = nextConfig