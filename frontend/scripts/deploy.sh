#!/bin/bash

# Production Deployment Script for Sudoku Master Web App

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if environment variables are set
echo "📋 Checking environment variables..."

required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_MONGODB_URI"
    "NEXT_PUBLIC_SITE_URL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables are set"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf build
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run linting
echo "🔍 Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before deploying."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before deploying."
    exit 1
fi

# Build the application
echo "🏗️ Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the issues before deploying."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check bundle size
echo "📊 Checking bundle size..."
npx @next/bundle-analyzer .next/static/chunks

# Deploy to Vercel (if vercel CLI is installed)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️ Vercel CLI not found. Please install it with: npm i -g vercel"
    echo "📝 Or deploy manually by pushing to your connected GitHub repository."
fi

echo "🎉 Deployment script completed!"
echo "📝 Next steps:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up monitoring and analytics"
echo "   4. Test all functionality on the deployed site" 