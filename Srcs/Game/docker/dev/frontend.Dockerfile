FROM node:20-alpine

WORKDIR /app

# Backend port configuration (for WebSocket connection)
ARG VITE_PORT=3000
ENV VITE_PORT=$VITE_PORT

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server with host exposed
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
