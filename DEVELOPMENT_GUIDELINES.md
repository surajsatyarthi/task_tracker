# Development Guidelines

## Required Process for All Features & Changes

### Phase 1: Understanding & Risk Assessment
- ✅ **Complete understanding of the task**
  - Read and analyze the requirements thoroughly
  - Identify all affected components and files
  - Understand the user's intent and expected outcome

- ✅ **Risks identified**
  - List potential breaking changes
  - Identify security concerns
  - Note performance implications
  - Document backward compatibility issues

### Phase 2: Verification Before Implementation
- ✅ **APIs tested**
  - Test existing API endpoints affected by changes
  - Verify request/response formats
  - Check authentication and authorization flows

- ✅ **Data checked**
  - Examine database schema
  - Review existing data structures
  - Verify data relationships and constraints

- ✅ **Code read**
  - Review existing implementations
  - Understand current patterns and conventions
  - Check for similar implementations to maintain consistency

### Phase 3: Planning & Documentation
- ✅ **Written plan with steps**
  - Create a step-by-step implementation plan
  - Define clear milestones
  - Identify dependencies between steps

- ✅ **Risk assessment**
  - Document potential failure points
  - Plan mitigation strategies
  - Identify monitoring requirements

- ✅ **Proof of verification**
  - Include screenshots where applicable
  - Document test results
  - Reference data sources and their timestamps

### Phase 4: Implementation & Testing
- ✅ **Test results / proof it works**
  - Provide working examples
  - Include test output or screenshots
  - Demonstrate the feature in action

- ✅ **Edge cases considered**
  - Test with empty/null values
  - Test with maximum/minimum values
  - Test error handling
  - Test concurrent operations
  - Test different user states/permissions

- ✅ **Rollback plan if needed**
  - Document how to revert changes
  - Identify breaking points
  - Plan database migration rollbacks if applicable

- ✅ **Confirmation data is current**
  - Verify test data timestamp
  - Confirm API versions
  - Document environment details with dates

## Development Standards

### Code Quality
- Follow existing code patterns and conventions
- Use TypeScript strict mode
- Pass ESLint checks before committing
- Maintain consistent formatting

### Testing Requirements
- Test all user-facing features manually
- Verify API responses
- Test edge cases and error scenarios
- Ensure backward compatibility

### Mandatory Verification Steps (CRITICAL)
**After EVERY file edit, you MUST:**
1. ✅ **Run `get_errors` tool** on modified files - catches JSX syntax errors, TypeScript errors, and build issues
2. ✅ **Read back changed code** to verify no copy-paste errors or malformed tags
3. ✅ **For UI/component changes**: Start dev server and verify build succeeds
4. ✅ **For JSX changes**: Double-check all opening/closing tags match

**These steps are MANDATORY and cannot be skipped. TypeScript compilation alone (`tsc --noEmit`) does NOT catch JSX syntax errors.**

### Documentation
- Update relevant documentation
- Add inline comments for complex logic
- Document API changes
- Include examples where helpful

### Commit Standards
- Write clear, descriptive commit messages
- Reference related issues or features
- Keep commits atomic and focused
- Test before committing

## Example Workflow

1. **Receive Request**: "Add remember me function on login screen"

2. **Phase 1 - Understanding**
   - Task: Add checkbox for persistent login sessions
   - Risks: Session security, localStorage usage, backward compatibility

3. **Phase 2 - Verification**
   - Read login/page.tsx
   - Check AuthContext.tsx signIn method
   - Verify Supabase auth configuration
   - Check existing session handling

4. **Phase 3 - Planning**
   - Step 1: Add checkbox UI to login form
   - Step 2: Add state management for rememberMe
   - Step 3: Store email in localStorage
   - Step 4: Update signIn to handle persistent sessions
   - Step 5: Test login flow with both states

5. **Phase 4 - Implementation & Testing**
   - Implement all changes
   - Test with remember me checked/unchecked
   - Test email persistence across page reloads
   - Test session persistence across browser restarts
   - Verify no ESLint errors
   - Confirm feature works as expected

## Rollback Procedures

### Code Rollback
```bash
git revert <commit-hash>
```

### Database Rollback
```bash
# For Supabase migrations
supabase db reset
# Or apply specific down migration
```

### Environment Variables
- Keep `.env.example` updated
- Document all required environment variables
- Never commit sensitive values

## Current Environment
- Next.js: 15.5.9
- React: 19.1.0
- Supabase: 2.75.0
- Node: >=20.0.0
- Last Updated: January 2, 2026
