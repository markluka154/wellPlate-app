/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdfkit']
  },
  images: {
    domains: ['localhost']
  }
}

export default nextConfig
