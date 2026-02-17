#!/bin/bash

echo "🚀 Starting Tipsio development server..."
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20.19.0
nvm use 20.19.0

echo "✅ Node version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""
echo "🔧 Starting Next.js dev server on http://localhost:3000"
echo ""

# Run dev server
npm run dev
