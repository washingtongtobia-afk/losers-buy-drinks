# Use Node.js 22 LTS Alpine for a small, fast-starting container
FROM node:22-alpine

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Install production dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY questions.js extra-questions.js server.js ./
COPY public/ ./public/

# Run as non-root user for security
USER node

# Cloud Run defaults to 8080
EXPOSE 8080

CMD ["node", "server.js"]
