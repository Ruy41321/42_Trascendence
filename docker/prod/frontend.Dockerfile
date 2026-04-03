# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Backend port configuration (for WebSocket connection)
ARG VITE_PORT
ENV VITE_PORT=$VITE_PORT

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install
# Copy source code
COPY . .

# Build for production (Vite will inline VITE_* env vars)
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst (gettext) to template nginx.conf at container start
RUN apk add --no-cache gettext

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration as a template (env vars substituted at runtime)
COPY config/nginx.conf /etc/nginx/templates/default.conf.template

# Create directory for SSL certificates (mounted at runtime)
RUN mkdir -p /etc/nginx/ssl

# Expose HTTPS ports
EXPOSE ${FRONTEND_PROD_HTTPS_PORT:-443}

# Substitute only our custom vars at startup, then launch nginx.
# The quoted variable list prevents envsubst from touching nginx's own $variables.
CMD ["sh", "-c", "envsubst '${GAME_SERVICE_HOST} ${GAME_SERVICE_INTERNAL_PORT} ${AUTH_SERVICE_HOST} ${AUTH_SERVICE_INTERNAL_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
