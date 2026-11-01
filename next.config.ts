import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

/**
 * Some Windows environments return EISDIR from fs.readlink on normal files.
 * Webpack treats that as fatal; remap to EINVAL so resolve continues.
 */
function patchReadlink() {
  const remap = (err: NodeJS.ErrnoException) => {
    if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
      const e = new Error(err.message) as NodeJS.ErrnoException;
      e.code = "EINVAL";
      return e;
    }
    return err;
  };

  const sync = fs.readlinkSync.bind(fs) as typeof fs.readlinkSync;
  (fs as typeof fs).readlinkSync = ((...args: Parameters<typeof fs.readlinkSync>) => {
    try {
      return sync(...args);
    } catch (err) {
      throw remap(err as NodeJS.ErrnoException);
    }
  }) as typeof fs.readlinkSync;

  const asyncFn = fs.readlink.bind(fs) as typeof fs.readlink;
  (fs as typeof fs).readlink = ((...args: unknown[]) => {
    const cb = args[args.length - 1];
    if (typeof cb === "function") {
      const rest = args.slice(0, -1);
      return (asyncFn as Function)(...rest, (err: NodeJS.ErrnoException | null, link?: string) => {
        if (err) return (cb as Function)(remap(err));
        return (cb as Function)(null, link);
      });
    }
    return (asyncFn as Function)(...args).catch((err: NodeJS.ErrnoException) => {
      throw remap(err);
    });
  }) as typeof fs.readlink;
}

patchReadlink();

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  staticPageGenerationTimeout: 180,
  images: {
    // Local `/public` assets only — no Unsplash/picsum remotes
    remotePatterns: [],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
