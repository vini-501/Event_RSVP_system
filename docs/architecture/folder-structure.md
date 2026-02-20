# Folder Structure Standard

This repository now follows a modularized structure in `lib/` while preserving backward compatibility for existing imports.

## Canonical layout

```txt
lib/
  core/
    constants.ts
    types.ts
    utils.ts
  auth/
    context.tsx
  network/
    api-client.ts
  data/
    mock-data.ts
  api/
    middleware/
    services/
    utils/
  supabase/
```

## Compatibility policy

- Legacy root files (for example `lib/constants.ts`, `lib/types.ts`) are now compatibility shims that re-export from canonical modules.
- New code should import from canonical modules:
  - `@/lib/core/constants`
  - `@/lib/core/types`
  - `@/lib/core/utils`
  - `@/lib/auth/context`
  - `@/lib/network/api-client`
  - `@/lib/data/mock-data`

## Migration rule

- Existing imports are intentionally kept working.
- Prefer canonical imports for all newly added files and when touching existing files.
