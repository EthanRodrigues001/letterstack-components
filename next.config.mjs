import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['@takumi-rs/core'],
  // /docs has no page of its own: the top level only holds root folders,
  // so send it to the current version.
  async redirects() {
    return [{ source: '/docs', destination: '/docs/v2', permanent: false }];
  },
};

export default withMDX(config);
