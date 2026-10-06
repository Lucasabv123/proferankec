#!/bin/bash

# File paths
ENV_FILE=".env"
ENV_DEV=".env.development"
ENV_PROD=".env.production"
PRISMA_SCRIPT="./switch-prisma-provider.sh"

# Function to switch the .env file and Prisma provider
switch_env() {
    if [ "$1" == "development" ]; then
        cp "$ENV_DEV" "$ENV_FILE"
        echo "Switched to development environment"
    elif [ "$1" == "production" ]; then
        cp "$ENV_PROD" "$ENV_FILE"
        echo "Switched to production environment"
    else
        echo "Unknown environment: $1"
        echo "Usage: $0 {development|production}"
        exit 1
    fi

    # Run the Prisma provider switch script
    $PRISMA_SCRIPT
}

# Check if the script received an argument
if [ -z "$1" ]; then
    echo "No environment specified."
    echo "Usage: $0 {development|production}"
    exit 1
else
    switch_env "$1"
fi
