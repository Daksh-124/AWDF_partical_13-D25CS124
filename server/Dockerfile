# ==========================================
# Backend Dockerfile (Node.js / Express API)
# Practical 11: Containerization with Docker
# ==========================================
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests first for optimal Docker layer caching
COPY package*.json ./

# Install production dependencies inside the Linux container
RUN npm install --omit=dev

# Copy backend application source code
COPY . .

# Expose Express server port
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
