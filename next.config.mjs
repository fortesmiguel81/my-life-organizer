/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lucide-react"],
  swcMinify: true,
  images: {
    domains: [],
    path: "/",
  },
};

export default nextConfig;
