#!/bin/bash

# Automated build check before every git push
# This runs locally to catch errors BEFORE they fail on Vercel

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🔍 Pre-Push Build Verification Running...          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Run TypeScript type check
echo "📝 Checking TypeScript types..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ TypeScript errors found - fix them before pushing!"
    exit 1
fi
echo "✅ TypeScript check passed"
echo ""

# Run linter
echo "🔍 Running ESLint..."
npm run lint -- --max-warnings 0 2>&1 | grep -E "Error|Warning|✓|✖" | head -20
LINT_EXIT=${PIPESTATUS[0]}

if [ $LINT_EXIT -ne 0 ]; then
    echo ""
    echo "⚠️  ESLint found issues (warnings allowed)"
fi
echo ""

# Run build
echo "🔨 Building production bundle..."
npm run build > /tmp/build-output.txt 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║        ✅ ALL CHECKS PASSED - Safe to push!               ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    exit 0
else
    echo "❌ Build FAILED!"
    echo ""
    echo "Build errors:"
    cat /tmp/build-output.txt | grep -A 10 "Failed to compile"
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║    ❌ BUILD FAILED - Push BLOCKED!                        ║"
    echo "║                                                            ║"
    echo "║    Fix the errors above before pushing.                   ║"
    echo "║    This prevents Vercel deployment failures!              ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
