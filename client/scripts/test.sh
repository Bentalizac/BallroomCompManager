#!/bin/bash

echo "🧪 Running Authentication Tests for BallroomCompManager"
echo "======================================================="

echo ""
echo "📋 Test Summary:"
echo "✅ Authentication Flow Tests (Integration)"

echo ""
echo "Running tests..."

# Run the auth integration tests
echo ""
echo "🔧 Running Authentication Flow Tests..."
pnpm test -- __tests__/auth.test.tsx --verbose

echo ""
echo "📊 Generating Coverage Report..."
pnpm test:coverage -- --testPathPattern="auth" --collectCoverageFrom="providers/auth/**/*.tsx" --collectCoverageFrom="services/auth/**/*.ts"

echo ""
echo "✅ Test run complete!"
echo ""
echo "💡 Quick Commands:"
echo "   pnpm test                    # Run all tests"
echo "   pnpm test:watch              # Run tests in watch mode"  
echo "   pnpm test:coverage           # Run with coverage report"
echo "   bash scripts/test.sh         # Run auth-specific tests"