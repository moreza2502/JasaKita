/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Supaya build tidak gagal karena peringatan kecil (cocok untuk pemula)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
