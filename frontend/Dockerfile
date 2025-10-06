# Use Node.js 18 image (not Alpine to avoid ARM64 issues)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Set build-time environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy source code
COPY . .

# Copy environment file
COPY env.local .env.local

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Install TypeScript for runtime (needed for next.config.ts)
RUN npm install typescript

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]

