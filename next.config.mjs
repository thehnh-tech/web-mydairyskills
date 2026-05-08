/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@mds/shared"],
  // Allow Next.js dev server to be reached from LAN IPs (e.g. phone on same wifi,
  // VPN-attached IPs like 128.179.x.x at EPFL). Loose in dev only.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.local",
    "128.179.0.0/16",
    "192.168.0.0/16",
    "10.0.0.0/8",
  ],
  typedRoutes: false,
};

export default nextConfig;
