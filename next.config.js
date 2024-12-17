/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "your-backend-domain.com",
      "admin.sixdesign.ca", // Added your domain
    ],
  },
};

module.exports = nextConfig;
