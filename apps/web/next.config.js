/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@promptpilot/ui', '@promptpilot/types', '@promptpilot/script-engine'],
};

module.exports = nextConfig;
