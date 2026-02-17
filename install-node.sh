#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 20.18.0
nvm install 20.18.0
nvm use 20.18.0

# Verify installation
node --version
npm --version

echo "Node.js 20.18.0 installed successfully!"
