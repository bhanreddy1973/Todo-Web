# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire app
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app using a lightweight HTTP server
CMD ["npx", "serve", "-s", "build"]
