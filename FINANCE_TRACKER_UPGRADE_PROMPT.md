# 🚀 Upgrade Finance Tracker CI/CD to Best-in-Class

Copy and paste this entire message to your AI assistant in the Finance Tracker VS Code project:

---

**Upgrade CI/CD pipeline to best-in-class with pnpm migration**

I need you to upgrade my existing CI/CD setup to match the best-in-class configuration. The current setup is good but needs optimization.

## Current State
- Using npm (slower)
- Has TypeScript check ✅
- Has PR validation ✅
- Has monorepo support ✅
- Build time: ~1-2 minutes

## Required Upgrades

### 1. Migrate from npm to pnpm
- Replace all npm commands with pnpm
- Delete package-lock.json
- Create pnpm-lock.yaml
- Update GitHub Actions workflow
- Update pre-push script
- Benefits: 2-3x faster builds, better caching

### 2. Add Advanced Caching
- Add pnpm store caching
- Add Next.js build cache
- Reduce build time from ~2 min to ~40 sec

### 3. Update All Scripts
- `.github/workflows/build-check.yml` - use pnpm
- `scripts/pre-push-check.sh` - use pnpm
- Keep all existing features (typecheck, lint, build)

## Implementation Steps

Execute these in order:

```bash
# 1. Install pnpm globally
npm install -g pnpm

# 2. Remove npm artifacts
rm -rf node_modules package-lock.json

# 3. Install with pnpm
pnpm install

# 4. Update scripts to use pnpm
# Update scripts/pre-push-check.sh: replace 'npm' with 'pnpm'

# 5. Test locally
pnpm run typecheck
pnpm run lint
pnpm run build

# 6. Stage changes
git add pnpm-lock.yaml package.json
git rm package-lock.json
git commit -m "chore: migrate to pnpm for 2-3x faster builds"
git push origin main
```

## Updated Workflow File

Replace the entire `.github/workflows/build-check.yml` with:

```yaml
name: Build Verification
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./finance-tracker
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: './finance-tracker/pnpm-lock.yaml'
      
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      - uses: actions/cache@v4
        name: Setup pnpm cache
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm run typecheck
      
      - name: Lint
        run: pnpm run lint
      
      - name: Build with dummy env vars
        env:
          NODE_ENV: production
          NEXT_PUBLIC_SUPABASE_URL: "https://example-project.supabase.co"
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU4MDQwMCwiZXhwIjoxOTU4MTU2NDAwfQ.example"
          NEXT_PUBLIC_LOCAL_MODE: "false"
          CRON_SECRET: "dummy-cron-secret-for-build"
        run: pnpm run build
```

## Updated Pre-Push Script

Replace `scripts/pre-push-check.sh` with:

```bash
#!/bin/bash

set -e

echo "🔍 Running pre-push checks..."

# Set dummy environment variables for build
export NODE_ENV=production
export NEXT_PUBLIC_SUPABASE_URL="https://example-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU4MDQwMCwiZXhwIjoxOTU4MTU2NDAwfQ.example"
export NEXT_PUBLIC_LOCAL_MODE="false"
export CRON_SECRET="dummy-cron-secret-for-build"

echo "1/3: TypeScript type check..."
pnpm run typecheck
echo "✅ TypeScript check passed"

echo "2/3: ESLint check..."
pnpm run lint
echo "✅ Lint check passed"

echo "3/3: Build check..."
pnpm run build
echo "✅ Build check passed"

echo ""
echo "✨ All pre-push checks passed!"
```

## Verification

After upgrade, run these to verify:

```bash
# 1. Verify pnpm works
pnpm run typecheck
pnpm run lint
pnpm run build

# 2. Test pre-push script
chmod +x scripts/pre-push-check.sh
./scripts/pre-push-check.sh

# 3. Check GitHub Actions
git push origin main
sleep 10 && gh run watch
```

## Expected Results

- ✅ Build time reduced from ~2min to ~40-60sec
- ✅ Disk space reduced by ~66%
- ✅ Better dependency resolution
- ✅ All existing features preserved
- ✅ Faster local development

## Deliverables

1. Updated `.github/workflows/build-check.yml` with pnpm + caching
2. Updated `scripts/pre-push-check.sh` with pnpm
3. New `pnpm-lock.yaml` file
4. Removed `package-lock.json`
5. Commit with message: "chore: migrate to pnpm for 2-3x faster builds"

---

**After completing this, your Finance Tracker will have the fastest, most efficient CI/CD setup of all projects!** 🏆
