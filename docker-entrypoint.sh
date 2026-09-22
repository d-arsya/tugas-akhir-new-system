#!/bin/sh
set -eu

write_env_js() {
	cat <<EOF > "/usr/share/nginx/html/$1/env.js"
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}",
  VITE_DEV_HIJACK: "${VITE_DEV_HIJACK:-}",
  VITE_SANTRI_URL: "${VITE_SANTRI_URL:-}"
};
EOF
}

for app in admin merchant psb santri; do
	write_env_js "$app"
done

exec nginx -g 'daemon off;'
