#!/bin/bash

# File to modify
PRISMA_FILE="prisma/schema.prisma"

# Check if the file exists
if [ ! -f "$PRISMA_FILE" ]; then
    echo "Error: $PRISMA_FILE not found!"
    exit 1
fi

# Function to switch the provider
switch_provider() {
    local CURRENT_PROVIDER=$1
    local NEW_PROVIDER=$2
    
    sed -i.bak "s/provider = \"$CURRENT_PROVIDER\"/provider = \"$NEW_PROVIDER\"/g" "$PRISMA_FILE"
    echo "Switched from $CURRENT_PROVIDER to $NEW_PROVIDER in $PRISMA_FILE"
}

# Determine the current provider and switch to the other one
if grep -q 'provider = "sqlite"' "$PRISMA_FILE"; then
    switch_provider "sqlite" "postgresql"
elif grep -q 'provider = "postgresql"' "$PRISMA_FILE"; then
    switch_provider "postgresql" "sqlite"
else
    echo "Error: Could not determine the current provider in $PRISMA_FILE"
    exit 1
fi
