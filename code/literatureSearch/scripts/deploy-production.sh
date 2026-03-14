#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$(cd "$script_dir/.." && pwd)"
repo_root="$(git -C "$app_dir" rev-parse --show-toplevel)"

build_id="$(git -C "$repo_root" rev-parse --short HEAD)"
build_timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
production_url="https://researchtool-literature-search.vercel.app"

verify_live_build() {
  BUILD_ID="$1" PRODUCTION_URL="$2" node <<'EOF'
const buildId = process.env.BUILD_ID;
const productionUrl = process.env.PRODUCTION_URL;

const response = await fetch(productionUrl, {
  redirect: "follow",
  headers: { "user-agent": "researchtool-deploy-check" },
});
const html = await response.text();
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

if (!text.includes(`Build ${buildId}`)) {
  process.exit(1);
}
EOF
}

cd "$app_dir"

echo "Running unit tests..."
npm run test:unit

echo "Running production build..."
npm run build

echo "Deploying production build $build_id..."
npx vercel deploy --prod --yes \
  --build-env NEXT_PUBLIC_BUILD_ID="$build_id" \
  --build-env NEXT_PUBLIC_BUILD_TIMESTAMP="$build_timestamp" \
  --build-env BUILD_GIT_COMMIT="$build_id" \
  --build-env BUILD_TIMESTAMP="$build_timestamp"

echo "Verifying live production badge..."
for attempt in {1..12}; do
  if verify_live_build "$build_id" "$production_url"; then
    echo "Production is live at $production_url with build $build_id"
    exit 0
  fi

  echo "Waiting for production alias to show build $build_id (attempt $attempt/12)..."
  sleep 5
done

echo "Live production did not show expected build id $build_id after deploy" >&2
exit 1
