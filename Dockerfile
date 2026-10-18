# ==========================================
# Frontend Dockerfile (React + Vite)
# Multi-Stage Build for Optimized Image Size
# Practical 11: Containerization with Docker
# ==========================================

# Stage 1: Build the React Application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application source code
COPY . .

# Build the production bundle into /app/dist
RUN npm run build

# Stage 2: Production Server Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package manifests and production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built production assets from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.js ./vite.config.js

# Expose Vite preview / client port
EXPOSE 5173

# Run the preview server bound to all network interfaces (0.0.0.0)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
