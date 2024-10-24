#!/bin/bash

# Set the S3 bucket and path
S3_BUCKET="base-templates-by-sahil2005"
S3_PATH="java/"

# Pull the code from S3 to the specific workspace directory using repl.owner from the environment
echo "Pulling code from S3..."
aws s3 cp s3://$S3_BUCKET/$S3_PATH /usr/src/app/workspaces/user123 --recursive --no-sign-request

# Start the Node.js application
exec node server.js
