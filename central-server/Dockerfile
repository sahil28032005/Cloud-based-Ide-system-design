# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /workspace

# Copy only the package.json and package-lock.json to leverage Docker caching
COPY ./vite-project /workspace/

RUN ls -l /workspace

# Expose the Vite development port (5173 by default)
EXPOSE 5173

# Start the Vite development server
CMD ["tail", "-f", "/dev/null"]
