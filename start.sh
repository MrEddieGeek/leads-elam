#!/bin/bash

echo "🔧 Running database migrations..."
npx prisma db push --accept-data-loss

echo "🚀 Starting server..."
node server/index.js
