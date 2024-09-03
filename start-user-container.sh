#!/bin/bash

# Generate a unique identifier for the user
USER_ID=$(uuidgen)

# Create a directory for the user's workspace
mkdir -p ./workspaces/$USER_ID

# Copy the Docker Compose template and replace placeholders
cp docker-compose-template.yml ./workspaces/$USER_ID/docker-compose.yml

# Navigate to the user's workspace directory
cd ./workspaces/$USER_ID

# Start the Docker container via retriving its id
CONTAINER_ID=$(docker-compose up -d | grep -o -e "Starting [a-z0-9]\+" | awk '{print $2}')
#APPLYING SPECIFIC LABEL TO TA=HAT CONTAINER
docker container update --label "user_id=$USER_ID" $CONTAINER_ID
#STRRING CONTAINER ID FOR BACKUP
echo $CONTAINER_ID > ./container_id.txt


# Output the user's container ID and workspace directory
echo "User ID: $USER_ID"
echo "Workspace Directory: $(pwd)"
echo "Container ID: $CONTAINER_ID"

