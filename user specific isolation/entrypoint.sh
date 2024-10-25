#!/bin/bash

# Set the S3 bucket and path
S3_BUCKET="base-templates-by-sahil2005"
S3_PATH="java/"

# Environment variables for creating userId and replId based folders
USER_ID=${REPL_OWNER:-default_user}
REPL_ID=${REPL_UNIQUE_ID:-default_repl}

# Define the target directory with nested structure
TARGET_DIR="/usr/src/app/workspaces/$USER_ID/$REPL_ID"

# Create the target directory
mkdir -p "$TARGET_DIR"

# Pull the code from S3 to the specific workspace directory
echo "Pulling code from S3..."
aws s3 cp s3://$S3_BUCKET/$S3_PATH "$TARGET_DIR" --recursive --no-sign-request

# Start the Node.js application
exec node server.js
