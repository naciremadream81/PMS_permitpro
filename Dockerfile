# Use Bun base image
# Use latest stable Bun image
FROM oven/bun:1.1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy package files
COPY package.json bun.lock ./

# Copy Prisma schema
COPY prisma/ ./prisma/

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Create uploads directory and make startup script executable
RUN mkdir -p uploads && chmod 755 uploads && \
    chmod +x start.sh

# Expose port
EXPOSE 8000

# Start command using the startup script
CMD ["./start.sh"]
