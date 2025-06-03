#!/bin/bash

echo "🚀 Starting test suite..."

# Backend Tests
echo "📦 Running Backend Tests..."
cd backend

echo "Running API Tests..."
npm run test:api

echo "Running Unit Tests..."
npm run test:unit

echo "Running Integration Tests..."
npm run test:integration

# Frontend Tests
echo "🎨 Running Frontend Tests..."
cd ../frontend

echo "Running Unit Tests..."
npm run test:unit

echo "Running E2E Tests..."
npm run test:e2e

echo "✅ All tests completed!" 