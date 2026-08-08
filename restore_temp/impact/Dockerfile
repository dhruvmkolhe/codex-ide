# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build-time environment variables (passed as ARGs for 'npm run build')
# Note: These are now injected at runtime via env.sh to avoid leaking in layers.
RUN npm run build

# Production Stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create a non-root user to run nginx
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
COPY env.sh /usr/share/nginx/html/env.sh

# Fix ownership
RUN chmod +x /usr/share/nginx/html/env.sh \
    && chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R appuser:appgroup /var/run/nginx.pid

USER appuser
EXPOSE 80

# Execute env.sh to generate env-config.js and then start Nginx
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh > /usr/share/nginx/html/env-config.js && nginx -g 'daemon off;'"]
