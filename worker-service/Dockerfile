# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Ensure we copy only if package.json exists
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Expose port
EXPOSE 4001

# Start the backend
CMD ["node", "server.js"]
