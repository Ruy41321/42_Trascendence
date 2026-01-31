FROM node:20-alpine

WORKDIR /app

# Port configuration
ARG PORT=3000
ENV PORT=$PORT

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY src ./src

# Expose WebSocket port
EXPOSE $PORT

# Start server with hot reload
CMD ["npm", "run", "dev"]
