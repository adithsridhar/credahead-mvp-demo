# CredAhead Development Notes

## Essential Commands

Before making any commits, always run:
```bash
npm run validate
```

This runs TypeScript checking and linting to prevent build issues.

## TypeScript Error Prevention

1. **Before committing**: Run `npm run validate`
2. **Before restarting dev server**: Run `npm run type-check`
3. **If buttons/UI stop working**: Check for TypeScript errors first

## Common TypeScript Issues to Watch For

- Set spread operations: Use `Array.from(mySet)` instead of `...mySet`
- Type mismatches: `null` vs `undefined` in interfaces
- Missing type annotations: Add explicit types for function parameters
- Import/export issues: Ensure all imports have proper types

## Build Process

TypeScript errors will break the build process, causing:
- Buttons to stop working
- Sign-in to fail  
- Components to not render

Always fix TypeScript errors before continuing development.