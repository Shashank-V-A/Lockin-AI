import type { NextConfig } from "next";

const baseCsp = [
  "default-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://utfs.io https://*.ufs.sh",
  "font-src 'self' data:",
  "connect-src 'self' https://api.groq.com https://uploadthing.com https://*.uploadthing.com https://utfs.io https://*.ufs.sh https://emkc.org",
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
    value: [...baseCsp, "script-src 'self' 'unsafe-inline'"].join("; "),
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
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  serverExternalPackages: ["pdf-parse"],
  transpilePackages: ["monaco-editor"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "framer-motion",
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
