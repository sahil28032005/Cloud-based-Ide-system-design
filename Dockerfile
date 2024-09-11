
# initial version dockerfile for managerial purposes
# # Use the official Node.js 14 image as the base image
# FROM node:18

# # Set the working directory inside the container
# WORKDIR /workspace

# # Copy only the package.json and package-lock.json for debugging
# # COPY ./vite-project/package.json /workspace/package.json
# # COPY ./vite-project/package-lock.json /workspace/package-lock.json


# COPY vite-project/package*.json ./

# # Install dependencies
# RUN npm install
# # Expose the Vite development port (5173 by default) ac

# # Copy the entire vite-project directory, excluding what’s in .dockerignore
# COPY vite-project/ .

# EXPOSE 5173

# # Start the Vite development server
# # CMD ["tail", "-f", "/dev/null"]
# CMD ["sh", "-c", "npm run dev & tail -f /dev/null"]

# update for manual spinup of conntainers
# Use a base image with both Node.js and Java installed
# Use an official OpenJDK base image
FROM openjdk:17-jdk-slim

# Install curl
RUN apt-get update && apt-get install -y curl build-essential

# Add Node.js 18 repository and install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 5127

# Command to run the application
CMD ["npm", "start"]


