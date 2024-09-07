# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /workspace

# Copy only the package.json and package-lock.json for debugging
# COPY ./vite-project/package.json /workspace/package.json
# COPY ./vite-project/package-lock.json /workspace/package-lock.json


COPY vite-project/package*.json ./

# Install dependencies
RUN npm install
# Expose the Vite development port (5173 by default) ac

# Copy the entire vite-project directory, excluding what’s in .dockerignore
COPY vite-project/ .

EXPOSE 5173

# Start the Vite development server
# CMD ["tail", "-f", "/dev/null"]
CMD ["sh", "-c", "npm run dev & tail -f /dev/null"]
