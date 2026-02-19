FROM node:18-alpine as builder

# Fix Alpine memory + npm issues
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL deps (including devDeps for build)
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install

# Copy source
COPY . .

# Build with max memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
