#!/bin/sh
# Generate env-config.js at runtime using environment variables
# Usage: ./env.sh > /usr/share/nginx/html/env-config.js

cat <<EOF
window._env_ = {
  REACT_APP_SUPABASE_URL: "${REACT_APP_SUPABASE_URL}",
  REACT_APP_SUPABASE_ANON_KEY: "${REACT_APP_SUPABASE_ANON_KEY}"
};
EOF
