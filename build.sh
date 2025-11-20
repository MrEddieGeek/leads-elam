#!/bin/bash

echo "Building Lead Generator Application..."

# Install root dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies and build
echo "Installing client dependencies..."
cd client
npm install

echo "Building client..."
npm run build

cd ..

echo "Build completed successfully!"
echo "To start the application, run: npm start"
