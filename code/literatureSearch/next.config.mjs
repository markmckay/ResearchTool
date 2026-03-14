import { execSync } from "node:child_process";

function resolveBuildId() {
  const explicitBuildId =
    process.env.NEXT_PUBLIC_BUILD_ID ??
    process.env.BUILD_GIT_COMMIT ??
    process.env.GITHUB_SHA;
  if (explicitBuildId) {
    return explicitBuildId.slice(0, 7);
  }

  const vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelCommitSha) {
    return vercelCommitSha.slice(0, 7);
  }

  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

function resolveBuildTimestamp() {
  const explicitBuildTime =
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? process.env.BUILD_TIMESTAMP;
  if (explicitBuildTime) {
    return explicitBuildTime;
  }

  return new Date().toISOString();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: resolveBuildId(),
    NEXT_PUBLIC_BUILD_TIMESTAMP: resolveBuildTimestamp(),
  },
};
export default nextConfig;
