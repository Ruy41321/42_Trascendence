# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Backend port configuration (for WebSocket connection)
ARG VITE_PORT
ENV VITE_PORT=$VITE_PORT

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build for production (Vite will inline VITE_* env vars)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Create directory for SSL certificates (mounted at runtime)
RUN mkdir -p /etc/nginx/ssl

# Expose HTTP and HTTPS ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
