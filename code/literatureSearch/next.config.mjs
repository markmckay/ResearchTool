import { execSync } from "node:child_process";

function resolveBuildId() {
  const explicitBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
  if (explicitBuildId) {
    return explicitBuildId;
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: resolveBuildId(),
  },
};
export default nextConfig;
