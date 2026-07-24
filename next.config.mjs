/** @type {import('next').NextConfig} */

// The demo is served under a sub-path on the main marketing site
// (lunarlogic.ai/amy), mirroring the existing lunarlogic.ai/gualapack demo.
// basePath tells Next.js to emit every route + asset URL under /amy so the
// page's CSS, fonts, charts, and internal links resolve correctly when the
// main site rewrites /amy/* to this deployment.
const nextConfig = {
  reactStrictMode: true,
  basePath: "/amy",
  assetPrefix: "/amy",
};

export default nextConfig;
