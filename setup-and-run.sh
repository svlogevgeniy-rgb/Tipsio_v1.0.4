#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20.18.0
nvm use 20.18.0

echo "Current Node version:"
node --version

echo "Installing dependencies..."
npm install

echo "Setup complete! You can now run: npm run dev"
