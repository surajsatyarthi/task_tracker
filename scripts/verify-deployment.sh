#!/bin/bash

# Script to verify Vercel deployment succeeded
# Usage: ./verify-deployment.sh

echo "🔍 Checking Vercel deployment status..."

# Wait a bit for deployment to start
sleep 10

# Check deployment status (retry up to 30 times, 10 seconds each = 5 minutes max)
for i in {1..30}; do
    echo "Attempt $i/30..."
    
    # Check if the site is accessible
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://task-tracker-suraj-satyarthis-projects.vercel.app/)
    
    if [ "$STATUS" -eq 200 ]; then
        echo "✅ Deployment successful! Site is live."
        
        # Quick sanity check - try to fetch the page
        CONTENT=$(curl -s https://task-tracker-suraj-satyarthis-projects.vercel.app/ | head -c 1000)
        
        if [[ $CONTENT == *"<!DOCTYPE html"* ]] || [[ $CONTENT == *"<html"* ]]; then
            echo "✅ HTML content verified"
            exit 0
        else
            echo "⚠️  Site returned unexpected content (might be redirecting)"
        fi
    elif [ "$STATUS" -eq 404 ]; then
        echo "❌ Deployment failed - got 404"
        exit 1
    else
        echo "   Status: $STATUS - waiting..."
        sleep 10
    fi
done

echo "⏱️  Deployment verification timed out after 5 minutes"
echo "   This doesn't mean it failed - it might still be deploying"
echo "   Check manually: https://vercel.com/suraj-satyarthis-projects/task-tracker"
exit 1
