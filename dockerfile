# Use a specific version of Node.js based on the latest stable version
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package manager files separately to leverage Docker cache layering
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the Prisma schema file into the container
COPY prisma ./prisma/

# Generate Prisma client, this step is essential for interacting with your database from code
RUN pnpm prisma generate
RUN pnpm prisma migrate

# Copy the rest of your application's code into the container
COPY . .

# Build your application using pnpm, assuming you have a build script defined in your package.json
RUN pnpm run build

# The command to run your application
CMD ["node", "dist/index.js"]