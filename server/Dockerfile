FROM node:20-alpine

# Install build dependencies (for bcrypt, etc if needed by node-gyp)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Use a non-root group/user
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

# Copy package files with correct ownership
COPY --chown=nodeuser:nodegroup package*.json ./

# Install packages as the non-root user
USER nodeuser
RUN npm install --omit=dev

# Copy application code with correct ownership
COPY --chown=nodeuser:nodegroup . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
