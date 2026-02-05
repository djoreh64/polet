#!/bin/sh
set -e

# generate runtime env file
cat <<EOT > /app/dist/env.js
window.VITE_API_URL = "${VITE_API_URL}";
EOT

exec "$@"
