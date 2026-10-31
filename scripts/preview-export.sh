#!/usr/bin/env bash
# Gera uma exportação estática da interface para pré-visualização (sem backend).
# robots.txt e sitemap.xml são rotas de servidor e ficam de fora da prévia;
# os arquivos são movidos temporariamente e restaurados ao final.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
STASH="$(mktemp -d)"
restore() {
  mv "$STASH"/robots.ts src/app/robots.ts 2>/dev/null || true
  mv "$STASH"/sitemap.ts src/app/sitemap.ts 2>/dev/null || true
  rmdir "$STASH" 2>/dev/null || true
}
trap restore EXIT
mv src/app/robots.ts src/app/sitemap.ts "$STASH"/
PREVIEW_EXPORT=1 npx next build
rm -rf preview-out && mv out preview-out
echo "Prévia estática gerada em preview-out/"
