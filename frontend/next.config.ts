import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "300mb",
    },
  },
  images: {
    remotePatterns: [
      ...(process.env.CLOUD_FRONT_DOMAIN
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.CLOUD_FRONT_DOMAIN as string,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "cdn.inflearn.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "malrang",
  project: "inflearn-clone-web",
  silent: !process.env.CI,
  widenClientFileUpload: process.env.CI ? true : false,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
