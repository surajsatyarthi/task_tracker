# CI/CD Setup Prompt for Other Projects

Copy and paste this prompt to your AI assistant in any VS Code project:

---

**Setup automated build verification and deployment pipeline**

I need you to set up automated CI/CD similar to my task-tracker project:

1. **GitHub Actions Workflow** that runs on every push to main:
   - Runs `npm run lint`
   - Runs `npm run build`
   - Uses dummy/placeholder environment variables for build (since real secrets are in Vercel)
   - Should pass even without real API keys

2. **Pre-push Git Hooks** (optional, for local verification):
   - Checks TypeScript compilation
   - Runs linting
   - Runs build before allowing push

3. **Deployment Verification Scripts**:
   - Script to verify production deployment is working
   - Script to check build status

**Requirements:**
- The workflow should prevent broken builds from being deployed
- Use dummy env vars in GitHub Actions (real ones stay in Vercel)
- Show clear success/failure status in GitHub commits
- Fast feedback (complete in ~1 minute)

**Reference Implementation:**

The GitHub Actions workflow should look like this:

```yaml
name: Build Verification
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - name: Build with dummy env vars
        env:
          # Add dummy values for all NEXT_PUBLIC_* variables
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "dummy-key-for-build-check"
          # Add other required public env vars with dummy values
        run: npm run build
```

**Adapt for my project:**
- Identify all required environment variables from my codebase
- Create appropriate dummy values for the build
- Ensure ESLint ignores utility scripts if needed
- Test that build passes with dummy env vars

**Deliverables:**
1. `.github/workflows/build-check.yml` - GitHub Actions workflow
2. `scripts/pre-push-check.sh` - Local pre-push validation (optional)
3. Updated `.env.example` if environment variables were missing
4. Verify build passes and create initial commit

---

**Additional Context (customize this section for each project):**

- Framework: [Next.js / React / Node.js / etc]
- Package Manager: [npm / yarn / pnpm]
- Deployment: [Vercel / Netlify / AWS / etc]
- Main Branch: [main / master]
- Required env vars: [list them or say "detect from code"]

---

After setup, I should see:
- ✅ Build passing locally
- ✅ Committed & pushed to GitHub  
- 🔄 GitHub Actions build running
- 🚀 Will auto-deploy to [Vercel/etc]
