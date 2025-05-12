FROM node:18-slim
LABEL authors="arche"

WORKDIR /express_bunny

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    netcat-traditional \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install wait-for-it script
RUN curl -o /usr/local/bin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with npm
RUN npm install

# Generate Prisma Client with the correct binary target
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8081

# Use wait-for-it to ensure database is ready before starting the application
CMD ["sh", "-c", "wait-for-it postgres:5432 -t 60 -- npx prisma generate && node app.js"]
