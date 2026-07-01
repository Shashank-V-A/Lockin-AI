import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function pistonConnectOrigin(): string {
  const url = process.env.PISTON_API_URL;
  if (!url) return "https://emkc.org";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

const baseCsp = [
  "default-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://utfs.io https://*.ufs.sh",
  "font-src 'self' data:",
  `connect-src 'self' https://api.groq.com https://uploadthing.com https://*.uploadthing.com https://utfs.io https://*.ufs.sh ${pistonConnectOrigin()}`.trim(),
  "frame-ancestors 'none'",
];

const defaultSecurityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      ...baseCsp,
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
    ].join("; "),
  },
];

const codingSecurityHeaders = [
  ...defaultSecurityHeaders.filter((h) => h.key !== "Content-Security-Policy"),
  {
    key: "Content-Security-Policy",
    value: [...baseCsp, "script-src 'self' 'unsafe-inline' 'unsafe-eval'"].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  serverExternalPackages: ["unpdf"],
  transpilePackages: ["monaco-editor"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-slot",
    ],
  },
  async headers() {
    return [
      { source: "/coding/:path*", headers: codingSecurityHeaders },
      { source: "/((?!coding).*)", headers: defaultSecurityHeaders },
    ];
  },
};

export default nextConfig;
