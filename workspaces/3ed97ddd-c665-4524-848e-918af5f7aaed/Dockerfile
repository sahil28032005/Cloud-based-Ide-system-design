# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /workspace

# Copy only the package.json and package-lock.json for debugging
COPY ./vite-project/package.json /workspace/package.json
COPY ./vite-project/package-lock.json /workspace/package-lock.json

# Expose the Vite development port (5173 by default)
EXPOSE 5173

# Start the Vite development server
CMD ["tail", "-f", "/dev/null"]
