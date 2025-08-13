/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    esmExternals: 'loose'
  },
}

export default nextConfig
