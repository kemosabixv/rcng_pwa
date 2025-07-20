const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      "d49d4fdbd10c4f2398ad688ea6eb9b2d-ae3693a4fefd422eaa6d5432d.fly.dev",
    ],
  },
});
