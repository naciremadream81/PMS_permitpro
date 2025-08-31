# Use Bun base image with OpenSSL
FROM oven/bun:1 as base
WORKDIR /app

# Install system dependencies in a single layer
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy package files for dependency caching
COPY package.json bun.lock ./

# Copy Prisma schema files before installing dependencies
COPY prisma/ ./prisma/

# Install dependencies (Prisma client will be generated automatically)
RUN bun install --frozen-lockfile --production=false

# Copy application source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads && \
    chmod 755 uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run db:generate > /dev/null 2>&1 || exit 1

# Start the application
CMD ["bun", "run", "start"]
