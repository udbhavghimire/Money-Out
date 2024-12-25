/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "your-backend-domain.com",
      "admin.sixdesign.ca", // Added your domain
    ],
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=self",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
