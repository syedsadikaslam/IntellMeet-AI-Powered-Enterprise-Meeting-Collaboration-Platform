FROM node:20-alpine

# Install build dependencies (for bcrypt, etc if needed by node-gyp)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

COPY . .

# Environment variables (placeholders, should be provided at runtime)
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Use a non-root user for security
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
USER nodeuser

CMD ["npm", "start"]
