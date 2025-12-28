# CI/CD Testing Steps - Copy & Paste Commands

## Test 1: Verify GitHub Actions Build

```bash
# Check latest build status
gh run list --repo surajsatyarthi/c-suite-magazine --limit 1

# View full build log
gh run view --repo surajsatyarthi/c-suite-magazine --log
```

Expected: ✅ Status shows completed/success

---

## Test 2: Test Pre-Push Script Locally

```bash
cd /Users/surajsatyarthi/Desktop/Magazine/ceo-magazine

# Run the verification script
./scripts/pre-push-check.sh
```

Expected output:
```
✓ TypeScript compilation successful
✓ ESLint passed
✓ Build completed successfully
All pre-push checks passed.
```

---

## Test 3: Test Breaking the Build (Intentional Failure)

```bash
# Make a small syntax error
echo "const broken = " >> src/app/page.tsx

# Try to run checks (should fail)
./scripts/pre-push-check.sh

# Fix it
git checkout src/app/page.tsx
```

Expected: ❌ Should fail with clear error message

---

## Test 4: Verify Environment Variables

```bash
# Check all required vars are documented
cat .env.example

# Verify .env.local exists for local dev (optional)
ls -la .env.local 2>/dev/null || echo "Create .env.local from .env.example for local dev"
```

---

## Test 5: Test a Real Commit

```bash
# Make a trivial change
echo "# Test comment" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin main

# Watch the build
sleep 10 && gh run watch --repo surajsatyarthi/c-suite-magazine
```

Expected: Build starts automatically, shows progress, completes with ✅

---

## Success Indicators Checklist

- [ ] GitHub Actions page shows green checkmark
- [ ] Commit on GitHub shows build status icon
- [ ] Pre-push script runs without errors locally
- [ ] Breaking changes are caught by CI before deployment
- [ ] Build completes in 1-3 minutes

---

## Optional: Add TypeScript Check to Workflow

```bash
# Edit .github/workflows/build-check.yml
# Add this step after the lint step:

- name: Type check
  run: pnpm tsc --noEmit
```

---

## Useful Commands

```bash
# Check workflow file exists
ls -la .github/workflows/build-check.yml

# Check pre-push script exists
ls -la scripts/pre-push-check.sh

# Make pre-push script executable (if needed)
chmod +x scripts/pre-push-check.sh

# View recent GitHub Actions runs
gh run list --repo surajsatyarthi/c-suite-magazine --limit 5

# Cancel a running workflow
gh run cancel --repo surajsatyarthi/c-suite-magazine <run-id>
```
