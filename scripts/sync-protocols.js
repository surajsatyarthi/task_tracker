#!/usr/bin/env node

/**
 * Protocol Sync Script
 *
 * Syncs protocol files from central GitHub repository to local .agent folder
 *
 * Usage:
 *   npm run sync:protocols           # Pull latest and sync
 *   npm run sync:protocols -- --init # First-time setup (clone repo)
 *
 * How it works:
 *   1. Clones/pulls from GitHub repo (ralph-protocols)
 *   2. Copies all files from cloned repo to .agent folder
 *   3. Preserves local .gitignore for .agent folder
 *
 * Prerequisites:
 *   - GitHub repo created: https://github.com/YOUR_USERNAME/ralph-protocols
 *   - Local protocol folder pushed to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  GITHUB_REPO: 'https://github.com/surajsatyarthi/ralph-protocols.git',
  LOCAL_CACHE_DIR: path.join(__dirname, '..', '.protocol-cache'),
  TARGET_DIR: path.join(__dirname, '..', '.agent'),
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
    });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    throw error;
  }
}

function validateGitHubRepo() {
  if (CONFIG.GITHUB_REPO.includes('YOUR_USERNAME')) {
    log('❌ Error: GitHub repository URL not configured', 'red');
    log('', 'reset');
    log('Please update scripts/sync-protocols.js:', 'yellow');
    log('  GITHUB_REPO: "https://github.com/YOUR_USERNAME/ralph-protocols.git"', 'yellow');
    log('', 'reset');
    log('Steps to set up:', 'cyan');
    log('  1. Create GitHub repo: ralph-protocols', 'cyan');
    log('  2. Push /Users/surajsatyarthi/Desktop/Projects/protocol to GitHub', 'cyan');
    log('  3. Update GITHUB_REPO in this script', 'cyan');
    log('  4. Run: npm run sync:protocols -- --init', 'cyan');
    process.exit(1);
  }
}

function cloneOrPullRepo(isInit = false) {
  if (!fs.existsSync(CONFIG.LOCAL_CACHE_DIR)) {
    log('📦 Cloning protocol repository (first time)...', 'cyan');
    exec(`git clone ${CONFIG.GITHUB_REPO} "${CONFIG.LOCAL_CACHE_DIR}"`);
    log('✅ Repository cloned successfully', 'green');
  } else {
    if (isInit) {
      log('⚠️  Cache directory already exists. Pulling latest changes...', 'yellow');
    } else {
      log('🔄 Pulling latest protocol updates...', 'cyan');
    }

    exec(`cd "${CONFIG.LOCAL_CACHE_DIR}" && git pull origin main`, true);
    log('✅ Protocols updated from GitHub', 'green');
  }
}

function copyProtocols() {
  log('📋 Syncing protocols to .agent folder...', 'cyan');

  // Ensure target directory exists
  if (!fs.existsSync(CONFIG.TARGET_DIR)) {
    fs.mkdirSync(CONFIG.TARGET_DIR, { recursive: true });
    log('📁 Created .agent folder', 'green');
  }

  // Get list of files from cache (excluding .git and node_modules)
  const files = fs.readdirSync(CONFIG.LOCAL_CACHE_DIR);
  let copiedCount = 0;

  files.forEach((file) => {
    // Skip git folder and other non-protocol files
    if (file === '.git' || file === 'node_modules' || file === '.DS_Store') {
      return;
    }

    const sourcePath = path.join(CONFIG.LOCAL_CACHE_DIR, file);
    const targetPath = path.join(CONFIG.TARGET_DIR, file);

    // Copy file or directory recursively
    if (fs.statSync(sourcePath).isDirectory()) {
      // Remove existing directory and copy fresh
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
      copyRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }

    copiedCount++;
  });

  log(`✅ Synced ${copiedCount} items to .agent folder`, 'green');
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function showSyncStatus() {
  log('', 'reset');
  log('📊 Sync Status:', 'bright');

  // Count files in .agent
  const agentFiles = fs.readdirSync(CONFIG.TARGET_DIR).filter(
    (f) => !f.startsWith('.') && f !== 'node_modules'
  );

  log(`  Protocol files in .agent: ${agentFiles.length}`, 'cyan');
  log('', 'reset');

  log('Key protocols:', 'bright');
  const keyProtocols = [
    'RALPH_PROTOCOL.md',
    'PM_PROTOCOL.md',
    'COMMUNICATION_PROTOCOL.md',
    'CIRCULAR_ENFORCEMENT.md',
    'SHAREABLE_PROMPTS_GUIDE.md',
  ];

  keyProtocols.forEach((protocol) => {
    const exists = fs.existsSync(path.join(CONFIG.TARGET_DIR, protocol));
    const status = exists ? '✅' : '❌';
    log(`  ${status} ${protocol}`, exists ? 'green' : 'red');
  });
}

// Main execution
function main() {
  const isInit = process.argv.includes('--init');

  log('', 'reset');
  log('═══════════════════════════════════════════════', 'bright');
  log('     ANTIGRAVITY PROTOCOL SYNC', 'bright');
  log('═══════════════════════════════════════════════', 'bright');
  log('', 'reset');

  try {
    // Step 1: Validate configuration
    validateGitHubRepo();

    // Step 2: Clone or pull repository
    cloneOrPullRepo(isInit);

    // Step 3: Copy protocols to .agent
    copyProtocols();

    // Step 4: Show status
    showSyncStatus();

    log('', 'reset');
    log('═══════════════════════════════════════════════', 'green');
    log('     ✅ SYNC COMPLETE', 'green');
    log('═══════════════════════════════════════════════', 'green');
    log('', 'reset');

    if (isInit) {
      log('Next steps:', 'cyan');
      log('  1. Review synced protocols in .agent folder', 'cyan');
      log('  2. Commit .gitignore changes (if any)', 'cyan');
      log('  3. Run sync periodically: npm run sync:protocols', 'cyan');
    }

  } catch (error) {
    log('', 'reset');
    log('═══════════════════════════════════════════════', 'red');
    log('     ❌ SYNC FAILED', 'red');
    log('═══════════════════════════════════════════════', 'red');
    log('', 'reset');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
