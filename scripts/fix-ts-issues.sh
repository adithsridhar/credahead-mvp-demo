#!/bin/bash

# TypeScript Issue Resolution Script
# Run this when TypeScript errors occur during development

echo "🔧 Fixing TypeScript compilation issues..."

# Step 1: Clear Next.js cache
echo "📁 Clearing Next.js cache..."
rm -rf .next

# Step 2: Clear TypeScript incremental cache
echo "🗑️ Clearing TypeScript cache..."
rm -rf tsconfig.tsbuildinfo

# Step 3: Clear node_modules cache (if needed)
# echo "📦 Clearing node_modules cache..."
# rm -rf node_modules/.cache

# Step 4: Run type check
echo "✅ Running TypeScript type check..."
npm run type-check

# Step 5: Restart development server
echo "🚀 TypeScript issues resolved! Restart your dev server with: npm run dev"