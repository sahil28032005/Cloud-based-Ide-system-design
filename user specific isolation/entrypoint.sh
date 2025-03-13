#!/bin/bash

# Handle SIGTERM and SIGINT
trap 'kill -TERM $NODE_PID' TERM INT

# Set the S3 bucket and path
S3_BUCKET="base-templates-by-sahil2005"
S3_PATH="java/"
TARGET_DIR="/usr/src/app/workspaces"

# Create the target directory
mkdir -p "$TARGET_DIR"

# Pull the code from S3
echo "Pulling code from S3..."
aws s3 cp s3://$S3_BUCKET/$S3_PATH "$TARGET_DIR" --recursive --no-sign-request

# Start the Node.js application in the background
node server.js &
NODE_PID=$!

# Wait for the Node.js process
wait $NODE_PID
