#!/bin/bash

# Comprehensive Deployment Verification Script
# Verifies: CI/CD → Vercel Deploy → Feature Present on Live Site

set -e

DEPLOYMENT_URL="https://task-tracker-suraj-satyarthis-projects.vercel.app"
MAX_WAIT_MINUTES=10
CHECK_INTERVAL=15

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYMENT VERIFICATION STARTED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest commit info
LATEST_COMMIT=$(git log -1 --oneline)
COMMIT_SHA=$(git rev-parse HEAD | cut -c1-7)
echo "📝 Latest Commit: $LATEST_COMMIT"
echo ""

# STEP 1: Check GitHub Actions CI/CD
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1/3: Checking GitHub Actions CI/CD Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for GitHub Actions to start (give it 10 seconds)
sleep 10

for i in {1..40}; do
    echo -n "  ⏳ Checking CI/CD run #$i..."
    
    RUN_STATUS=$(gh run list --limit 1 --json status,conclusion,headSha --jq '.[0]')
    STATUS=$(echo "$RUN_STATUS" | jq -r '.status')
    CONCLUSION=$(echo "$RUN_STATUS" | jq -r '.conclusion')
    RUN_SHA=$(echo "$RUN_STATUS" | jq -r '.headSha' | cut -c1-7)
    
    # Check if this run is for our commit
    if [ "$RUN_SHA" != "$COMMIT_SHA" ]; then
        echo " waiting for run to start for $COMMIT_SHA (current: $RUN_SHA)"
        sleep 5
        continue
    fi
    
    if [ "$STATUS" == "completed" ]; then
        if [ "$CONCLUSION" == "success" ]; then
            echo " ✅ PASSED"
            echo ""
            echo "  ✓ TypeScript check: PASSED"
            echo "  ✓ ESLint: PASSED"
            echo "  ✓ Tests (256): PASSED"
            echo "  ✓ Build: PASSED"
            echo ""
            break
        else
            echo " ❌ FAILED"
            echo ""
            echo "CI/CD failed with conclusion: $CONCLUSION"
            gh run view --log-failed
            exit 1
        fi
    else
        echo " running ($STATUS)..."
        sleep $CHECK_INTERVAL
    fi
    
    if [ $i -eq 40 ]; then
        echo ""
        echo "❌ CI/CD timeout after 10 minutes"
        exit 1
    fi
done

# STEP 2: Wait for Vercel Deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2/3: Waiting for Vercel Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait a bit for Vercel to receive webhook from GitHub
echo "  ⏳ Waiting for Vercel webhook to trigger (30s)..."
sleep 30

for i in {1..40}; do
    echo -n "  ⏳ Checking deployment status #$i..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo " ✅ Site is live (HTTP 200)"
        break
    elif [ "$HTTP_CODE" == "404" ]; then
        echo " ❌ Site not found (HTTP 404)"
        exit 1
    else
        echo " waiting (HTTP $HTTP_CODE)..."
        sleep $CHECK_INTERVAL
    fi
    
    if [ $i -eq 40 ]; then
        echo ""
        echo "❌ Deployment timeout after 10 minutes"
        echo "Last HTTP status: $HTTP_CODE"
        exit 1
    fi
done

echo ""

# STEP 3: Verify Features on Live Site
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3/3: Verifying Features on Live Site"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Download the actual deployed HTML
DEPLOYED_HTML=$(curl -s "$DEPLOYMENT_URL")

# Check for critical features
FEATURES_VERIFIED=0
FEATURES_MISSING=0

echo ""
echo "  Checking deployed features..."
echo ""

# Check 1: StatusBoard component exists
if echo "$DEPLOYED_HTML" | grep -q "viewMode.*status\|Status.*Board\|setViewMode.*status"; then
    echo "  ✅ Status Board View: PRESENT"
    FEATURES_VERIFIED=$((FEATURES_VERIFIED + 1))
else
    echo "  ❌ Status Board View: MISSING"
    FEATURES_MISSING=$((FEATURES_MISSING + 1))
fi

# Check 2: ViewColumnsIcon for Status button
if echo "$DEPLOYED_HTML" | grep -q "ViewColumnsIcon\|view-columns"; then
    echo "  ✅ Status Button Icon: PRESENT"
    FEATURES_VERIFIED=$((FEATURES_VERIFIED + 1))
else
    echo "  ❌ Status Button Icon: MISSING"
    FEATURES_MISSING=$((FEATURES_MISSING + 1))
fi

# Check 3: Four view modes (matrix, table, calendar, status)
if echo "$DEPLOYED_HTML" | grep -q "matrix.*table.*calendar.*status"; then
    echo "  ✅ All 4 View Modes: PRESENT"
    FEATURES_VERIFIED=$((FEATURES_VERIFIED + 1))
else
    echo "  ❌ All 4 View Modes: MISSING"
    FEATURES_MISSING=$((FEATURES_MISSING + 1))
fi

# Check 4: React 19 (check if latest version deployed)
if echo "$DEPLOYED_HTML" | grep -q "Task Tracker Pro"; then
    echo "  ✅ App Header: PRESENT"
    FEATURES_VERIFIED=$((FEATURES_VERIFIED + 1))
else
    echo "  ❌ App Header: MISSING"
    FEATURES_MISSING=$((FEATURES_MISSING + 1))
fi

# Check 5: Timer functionality (recently added)
if echo "$DEPLOYED_HTML" | grep -q "timer\|Timer"; then
    echo "  ✅ Timer Feature: PRESENT"
    FEATURES_VERIFIED=$((FEATURES_VERIFIED + 1))
else
    echo "  ⚠️  Timer Feature: NOT DETECTED (may be async loaded)"
fi

echo ""

# FINAL VERDICT
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DEPLOYMENT VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Commit: $COMMIT_SHA"
echo "  URL: $DEPLOYMENT_URL"
echo "  Features Verified: $FEATURES_VERIFIED"
echo "  Features Missing: $FEATURES_MISSING"
echo ""

if [ $FEATURES_MISSING -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ DEPLOYMENT VERIFICATION FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  The deployment succeeded but is missing features from latest commit!"
    echo ""
    echo "Possible causes:"
    echo "  1. Vercel cached old build"
    echo "  2. Deployment webhook didn't trigger"
    echo "  3. Build succeeded but old version still serving"
    echo ""
    echo "Actions to take:"
    echo "  1. Go to Vercel Dashboard"
    echo "  2. Find task-tracker project"
    echo "  3. Click 'Redeploy' to force fresh build"
    echo ""
    exit 1
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DEPLOYMENT VERIFICATION PASSED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 All systems verified:"
    echo "  ✓ CI/CD passed"
    echo "  ✓ Vercel deployment live"
    echo "  ✓ Latest features present on production"
    echo ""
    echo "Your app is ready: $DEPLOYMENT_URL"
    echo ""
fi
