#!/bin/bash

echo "🚀 Deploying Frontend to Railway..."

# Build the frontend
echo "📦 Building frontend..."
cd permitpro-frontend
bun run build

# Create a simple server for the built files
echo "🌐 Creating simple server..."
cat > serve.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
EOF

# Add express to dependencies
echo "📦 Adding express dependency..."
echo '"express": "^4.18.2"' >> package.json

echo "✅ Frontend ready for deployment!"
echo "📋 Next steps:"
echo "1. Go to Railway dashboard"
echo "2. Create new service from permitpro-frontend directory"
echo "3. Set REACT_APP_API_URL=https://pmspermitpro-production.up.railway.app"
