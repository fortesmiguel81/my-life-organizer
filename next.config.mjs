/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["lucide-react"],
  swcMinify: true,
  images: {
    domains: [],
    path: "/",
  },
};

export default nextConfig;
