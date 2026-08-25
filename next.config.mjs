/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["lucide-react"],
  images: {
    domains: [],
    path: "/",
  },
};

export default nextConfig;
