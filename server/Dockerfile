FROM node:20-alpine

# Set application directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Create non-root user and set permissions on /app
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup && \
    chown -R nodeuser:nodegroup /app

# Copy package files
COPY --chown=nodeuser:nodegroup package*.json ./

# Switch to non-root user for installation
USER nodeuser
RUN npm install --omit=dev

# Copy application code
COPY --chown=nodeuser:nodegroup . .

# CMD directly to handle signals correctly (SIGTERM)
CMD ["node", "index.js"]
