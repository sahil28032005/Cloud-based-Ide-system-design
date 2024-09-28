#!/bin/bash

# Check the LANG environment variable and install the language
if [ "$LANG" = "python" ]; then
    echo "Installing Python..."
    apt-get update && apt-get install -y python3 python3-pip
elif [ "$LANG" = "java" ]; then
    echo "Installing Java..."
    apt-get update && apt-get install -y default-jdk
elif [ "$LANG" = "nodejs" ]; then
    echo "Node.js is already installed"
else
    echo "No valid language specified. Exiting..."
    exit 1
fi

# Execute the CMD specified in the Dockerfile
exec "$@"
