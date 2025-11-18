# Feature Design Document

## 1. Feature Summary
**Purpose:**  
Intelligent post-authentication redirect system that returns users to their intended destination after login, creating seamless user experience by preserving navigation context.

**Primary Goals:**  
- Return users to the page they were viewing before authentication
- Intelligently simplify redirect paths to avoid deep sub-pages
- Provide safe fallback to home page for unknown paths
- Support extensible pattern matching for future route additions

**Status:**  
- ✅ **Completed**

---

## 2. Context & Motivation
Without redirect handling, users who click "Login" from deep within the application (e.g., viewing a specific competition event) would always land on `/home` after authentication, forcing them to manually navigate back.

**Limitations in current design:**  
- Generic auth redirects disrupted user flow
- Loss of context when viewing competition details
- Poor UX for authenticated-only actions

**Related work:**  
- Complements JWT authentication system (ADR-003)
- Integrates with Next.js App Router navigation
- Uses sessionStorage for reliable path preservation

---

## 3. Affected Components

### Server
- **Supabase queries impacted**: None
- **New tables or schema updates**: None
- **API routes added or modified**: None  
- **Business logic changes**: None (pure client-side feature)

### Shared
- **Domain types added/modified**: None
- **Interfaces updated**: None
- **Mapping logic impacted**: None

### Client
- **UI views added or updated**:
  - `app/auth/page.tsx` - Auth form with post-login redirect logic
  - All header components - Updated login buttons to store current path
- **Type usage changes**: None
- **New service functions**:
  - `lib/redirects.ts` - Core redirect pattern matching and configuration
  - `hooks/useAuthRedirect.ts` - React hook for redirect functionality

---

## 4. Data Model Changes

### Database Schema Changes (Supabase)
No database changes required - all state stored client-side in sessionStorage.

### Domain Types (Shared Project)
No domain types affected - uses browser APIs only.

---

## 5. API Design
No API endpoints - client-side feature only.

---

## 6. Interaction Flow
```
1. User navigates to protected page (e.g., /comp/123/events/456/schedule)
2. User clicks "Login" button in header
3. Client stores current path in sessionStorage under key 'auth-redirect'
4. Client also adds path as URL param: /auth?redirect=/comp/123/events/456/schedule
5. Client navigates to /auth page
6. User enters credentials and submits form
7. Supabase Auth authenticates user
8. Client detects auth state change (useEffect on user object)
9. Client calls handlePostAuthRedirect()
10. Function retrieves stored path from sessionStorage
11. Function applies pattern matching to simplify path:
    - /comp/123/events/456/schedule → /comp/123/events/456 (event detail page)
12. Client navigates using router.replace() (no back button issue)
13. Client clears sessionStorage redirect value
```

---

## 7. Edge Cases & Constraints

### Pattern Matching Rules
- Competition event sub-pages → Event detail page (e.g., `/comp/123/events/456/schedule` → `/comp/123/events/456`)
- Competition sub-pages → Competition page (e.g., `/comp/123/settings` → `/comp/123`)
- Organization event sub-pages → Org event page (e.g., `/org/abc/events/xyz/details` → `/org/abc/events/xyz`)
- Organization sub-pages → Organization page (e.g., `/org/abc/settings` → `/org/abc`)
- Studio class sub-pages → Class page (e.g., `/studio/s1/classes/c1/roster` → `/studio/s1/classes/c1`)
- Event sub-pages → Event page (e.g., `/event/e1/tickets` → `/event/e1`)
- Unknown or invalid paths → `/home` (safe fallback)

### Browser Storage Constraints
- Requires `sessionStorage` support (available in all modern browsers)
- Falls back to URL parameter if sessionStorage fails
- Storage cleared after redirect to prevent stale data

### Security Considerations
- No sensitive data stored in sessionStorage
- Paths validated through pattern matching
- Malicious redirect attempts fall back to `/home`

---

## 8. Migration Plan
Feature was implemented directly with no backward compatibility concerns. No data migration needed.

**Rollout:**
- ✅ Implement core redirect logic (`lib/redirects.ts`)
- ✅ Create React hook (`hooks/useAuthRedirect.ts`)
- ✅ Update all header components to use `redirectToAuth()`
- ✅ Update auth form to call `handlePostAuthRedirect()`
- ✅ Test all redirect patterns
- ✅ Deploy to production

---

## 9. Test Strategy

### Unit Tests
- ✅ Pattern matching logic (`__tests__/redirects.test.ts`)
- Test cases cover:
  - Default fallback path (`/home`)
  - Competition route redirects (nested events and sub-pages)
  - Organization route redirects
  - Studio route redirects
  - Event route redirects
  - Invalid path handling

### Integration Tests
Manual testing of user flows:
- ✅ Login from competition page → redirect to competition
- ✅ Login from event schedule → redirect to event detail
- ✅ Login from unknown page → redirect to home
- ✅ Login without stored redirect → redirect to home

### Manual / UI Tests
- ✅ Test across different browsers (Chrome, Safari, Firefox)
- ✅ Test with disabled sessionStorage (fallback to URL param)
- ✅ Test back button behavior (should not return to auth page)

---

## 10. Open Questions
- ✅ **Resolved**: Should we redirect to exact path or simplified? → Simplified to parent resource
- ✅ **Resolved**: How to handle deep nesting? → Pattern matching extracts key IDs
- ⚠️ **Open**: Should we add a maximum redirect depth to prevent abuse?
- ⚠️ **Open**: Should we track redirect analytics to understand user flows?

---

## 11. Final Checklist
- [x] Domain types updated (N/A)
- [x] Database schema updated (N/A)
- [x] Server logic updated (N/A)
- [x] API routes updated (N/A)
- [x] Client views updated (auth form, headers)
- [x] Mappers updated (N/A)
- [x] Tests implemented (`__tests__/redirects.test.ts`)
- [x] Docs updated (`client/docs/LOGIN_REDIRECTS.md`)
- [ ] RAG embeddings refreshed ← **Next step**

---

## Extensibility Guide

### Adding New Route Patterns
The system uses a fluent builder pattern in `lib/redirects.ts`:

**Simple Resources** (e.g., `/workshop/[id]`):
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addSimpleResource('workshop')
  .build('/home');
```

**Nested Resources** (e.g., `/comp/[id]/judges/[judgeId]`):
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addNestedResource('comp', 'judges')
  .build('/home');
```

**Custom Complex Patterns**:
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addCustomPattern(
    /^\/admin\/reports\/([^\/]+)\/([^\/]+)/,
    (matches) => `/admin/reports/${matches[1]}/${matches[2]}`
  )
  .build('/home');
```

---

## Benefits Summary
✅ **Seamless UX**: Users return to their intended destination  
✅ **Context Preservation**: Competition/event context maintained  
✅ **Extensible**: Easy to add new route patterns via builder  
✅ **Fallback Safe**: Always has a default destination (`/home`)  
✅ **Tested**: Comprehensive test coverage  
✅ **Performance**: Uses sessionStorage for reliability  
✅ **No Back Button Issues**: Uses `router.replace()` instead of `router.push()`
