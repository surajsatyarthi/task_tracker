#!/usr/bin/env node

/**
 * Smart Deployment Verification
 * Checks GitHub Actions + Vercel deployment status + Feature verification
 */

const https = require('https');
const { execSync } = require('child_process');

const VERCEL_PROJECT_NAME = 'task-tracker';
const DEPLOYMENT_URL = 'https://task-tracker-suraj-satyarthis-projects.vercel.app';
const MAX_WAIT_MINUTES = 10;
const CHECK_INTERVAL_SECONDS = 15;

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function checkGitHubActions() {
  log('\n📋 Step 1: Checking GitHub Actions CI/CD...', 'cyan');
  
  try {
    const result = execSync('gh run list --limit 1 --json conclusion,status,name,createdAt', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const runs = JSON.parse(result);
    if (runs.length === 0) {
      log('❌ No CI/CD runs found', 'red');
      return false;
    }
    
    const latestRun = runs[0];
    const timeAgo = Math.round((Date.now() - new Date(latestRun.createdAt)) / 60000);
    
    if (latestRun.status === 'in_progress' || latestRun.status === 'queued') {
      log(`⏳ CI/CD still running (started ${timeAgo}m ago)...`, 'yellow');
      return 'running';
    }
    
    if (latestRun.conclusion === 'success') {
      log(`✅ CI/CD passed (${timeAgo}m ago)`, 'green');
      return true;
    } else {
      log(`❌ CI/CD failed: ${latestRun.conclusion}`, 'red');
      log('   Run: gh run view --log-failed', 'yellow');
      return false;
    }
  } catch (error) {
    log(`⚠️  Could not check CI/CD: ${error.message}`, 'yellow');
    return 'unknown';
  }
}

async function waitForDeployment() {
  log('\n🚀 Step 2: Waiting for Vercel deployment...', 'cyan');
  
  const maxAttempts = Math.floor((MAX_WAIT_MINUTES * 60) / CHECK_INTERVAL_SECONDS);
  let attempt = 0;
  let lastError = '';
  
  while (attempt < maxAttempts) {
    attempt++;
    const elapsed = Math.floor((attempt * CHECK_INTERVAL_SECONDS) / 60);
    const remaining = MAX_WAIT_MINUTES - elapsed;
    
    try {
      const response = await getRequest(DEPLOYMENT_URL);
      console.log(''); // New line after progress
      log(`✅ Deployment is live! (after ${elapsed}m)`, 'green');
      return response;
    } catch (error) {
      lastError = error.message;
      if (error.message.includes('401')) {
        process.stdout.write(`\r⏳ Building/deploying... ${elapsed}m elapsed, ${remaining}m remaining    `);
      } else if (error.message.includes('404')) {
        console.log(''); // New line
        log(`❌ Site not found (HTTP 404) - check Vercel project name`, 'red');
        return null;
      } else if (error.message.includes('ENOTFOUND')) {
        console.log(''); // New line
        log(`❌ Domain not reachable - check URL`, 'red');
        return null;
      } else {
        process.stdout.write(`\r⚠️  HTTP error: ${error.message} (attempt ${attempt}/${maxAttempts})    `);
      }
      
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_SECONDS * 1000));
    }
  }
  
  console.log(''); // New line
  log(`❌ Deployment timed out after ${MAX_WAIT_MINUTES} minutes`, 'red');
  log(`   Last error: ${lastError}`, 'yellow');
  return null;
}

async function verifyFeatures(html) {
  log('\n🔍 Step 3: Verifying deployed features...', 'cyan');
  
  const features = [
    { name: 'Matrix View', pattern: /Matrix/i, required: true },
    { name: 'Table View', pattern: /Table/i, required: true },
    { name: 'Calendar View', pattern: /Calendar/i, required: true },
    { name: 'Status Board', pattern: /Status.*Button|ViewColumnsIcon|viewMode.*status/i, required: true },
  ];
  
  let allPassed = true;
  
  for (const feature of features) {
    const found = feature.pattern.test(html);
    if (found) {
      log(`  ✅ ${feature.name}`, 'green');
    } else {
      log(`  ${feature.required ? '❌' : '⚠️ '} ${feature.name} - NOT FOUND`, feature.required ? 'red' : 'yellow');
      if (feature.required) allPassed = false;
    }
  }
  
  return allPassed;
}

async function getLatestCommit() {
  try {
    const sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    return { sha: sha.substring(0, 7), message };
  } catch {
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('🎯 DEPLOYMENT VERIFICATION SYSTEM', 'cyan');
  console.log('='.repeat(60));
  
  const commit = await getLatestCommit();
  if (commit) {
    log(`📦 Local commit: ${commit.sha} - ${commit.message}`, 'blue');
  }
  
  // Step 1: Check CI/CD
  const ciStatus = await checkGitHubActions();
  
  if (ciStatus === false) {
    log('\n❌ DEPLOYMENT BLOCKED: CI/CD failed', 'red');
    process.exit(1);
  }
  
  if (ciStatus === 'running') {
    log('\n⏳ Waiting for CI/CD to complete...', 'yellow');
    log('   This verification will check deployment after CI passes', 'yellow');
    process.exit(0);
  }
  
  // Step 2: Wait for deployment
  const html = await waitForDeployment();
  
  if (!html) {
    log('\n❌ DEPLOYMENT FAILED: Timeout', 'red');
    log('\n💡 Troubleshooting:', 'yellow');
    log('   1. Check Vercel dashboard: https://vercel.com/dashboard', 'yellow');
    log('   2. Check for build errors in Vercel logs', 'yellow');
    log('   3. Try manual redeploy from Vercel dashboard', 'yellow');
    process.exit(1);
  }
  
  // Step 3: Verify features
  const featuresOk = await verifyFeatures(html);
  
  // Final report
  console.log('\n' + '='.repeat(60));
  if (featuresOk) {
    log('✅ DEPLOYMENT VERIFIED - ALL FEATURES PRESENT', 'green');
    log(`\n🌐 Live URL: ${DEPLOYMENT_URL}`, 'cyan');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } else {
    log('❌ DEPLOYMENT INCOMPLETE - MISSING FEATURES', 'red');
    log('\n💡 Next steps:', 'yellow');
    log('   1. Force redeploy: git commit --allow-empty -m "redeploy" && git push', 'yellow');
    log('   2. Or redeploy from Vercel dashboard', 'yellow');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Verification error: ${error.message}`, 'red');
  process.exit(1);
});
