# Login Redirect System

This document describes the intelligent redirect system implemented for post-authentication navigation.

## Overview

When users log in, they are automatically redirected to the appropriate page based on where they originated from. This creates a seamless user experience by returning users to their intended destination.

## How It Works

### 1. Redirect Storage
- When a user clicks "Login" from any page, the current path is stored in `sessionStorage`
- The path is also added as a URL parameter as a backup: `/auth?redirect=/comp/123/schedule`

### 2. Post-Authentication Redirect
- After successful login, the system determines where to send the user
- Uses pattern matching to intelligently choose the best redirect destination

### 3. Redirect Patterns

| Origin Path | Redirect Destination | Example |
|-------------|---------------------|---------|
| `/comp/[id]/events/[eventId]/*` | `/comp/[id]/events/[eventId]` | `/comp/123/events/456/schedule` → `/comp/123/events/456` |
| `/comp/[id]/*` | `/comp/[id]` | `/comp/123/schedule` → `/comp/123` |
| `/org/[id]/events/[eventId]/*` | `/org/[id]/events/[eventId]` | `/org/studio/events/recital/details` → `/org/studio/events/recital` |
| `/org/[id]/*` | `/org/[id]` | `/org/my-org/settings` → `/org/my-org` |
| `/studio/[id]/classes/[classId]/*` | `/studio/[id]/classes/[classId]` | `/studio/abc/classes/waltz/schedule` → `/studio/abc/classes/waltz` |
| `/event/[id]/*` | `/event/[id]` | `/event/gala/tickets` → `/event/gala` |
| Any other path | `/home` | `/dashboard` → `/home` |

## Implementation

### Core Files

```
lib/redirects.ts          # Core redirect logic and configuration
hooks/useAuthRedirect.ts  # React hook for redirect functionality
components/auth/authForm.tsx  # Updated to handle post-auth redirects
components/headers/       # Headers use redirectToAuth for login links
```

### Key Functions

#### `getPostAuthRedirect(originPath)`
Determines the redirect destination based on the origin path.

```typescript
getPostAuthRedirect('/comp/123/schedule') // Returns: '/comp/123'
getPostAuthRedirect('/dashboard')         // Returns: '/home'
```

#### `useAuthRedirect()` Hook
Provides redirect functionality for React components.

```typescript
const { handlePostAuthRedirect, redirectToAuth } = useAuthRedirect();

// Store current path and navigate to auth
redirectToAuth(pathname);

// Handle redirect after successful auth
handlePostAuthRedirect();
```

### Usage in Components

#### Headers (Login Links)
```typescript
// Instead of: <Link href="/auth">Login</Link>
<button onClick={() => redirectToAuth(pathname)}>Login</button>
```

#### Auth Form (Post-Login)
```typescript
useEffect(() => {
  if (user && !loading) {
    handlePostAuthRedirect(); // Automatic redirect after login
  }
}, [user, loading, handlePostAuthRedirect]);
```

## Extensibility

### Adding New Route Patterns

The system uses a fluent builder pattern for maximum extensibility. To add new patterns, update the configuration in `lib/redirects.ts`:

#### Simple Resources
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addSimpleResource('workshop')     // /workshop/[id] → /workshop/[id]
  .addSimpleResource('instructor')   // /instructor/[id] → /instructor/[id]
  // ... existing patterns
  .build('/home');
```

#### Nested Resources  
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addNestedResource('comp', 'judges')     // /comp/[id]/judges/[judgeId]
  .addNestedResource('studio', 'students') // /studio/[id]/students/[studentId]
  // ... existing patterns
  .build('/home');
```

#### Custom Complex Patterns
```typescript
const REDIRECT_CONFIG = new RedirectConfigBuilder()
  .addCustomPattern(
    /^\/admin\/reports\/([^\/]+)\/([^\/]+)/,
    (matches) => `/admin/reports/${matches[1]}/${matches[2]}`
  )
  // ... existing patterns
  .build('/home');
```

### Custom Redirect Logic

For complex redirect logic, you can extend the `getPostAuthRedirect` function or create custom redirect handlers:

```typescript
// Custom logic for specific use cases
if (originPath.startsWith('/admin') && userRole !== 'admin') {
  return '/unauthorized';
}
```

## Testing

The redirect logic is thoroughly tested in `__tests__/redirects.test.ts`:

```bash
pnpm test -- __tests__/redirects.test.ts
```

Tests cover:
- Default path fallbacks
- Competition route redirects
- Future route patterns
- Edge cases and invalid paths

## Benefits

✅ **Seamless UX**: Users return to where they intended to go  
✅ **Context Preservation**: Competition context is maintained  
✅ **Extensible**: Easy to add new route patterns  
✅ **Fallback Safe**: Always has a default destination  
✅ **Tested**: Comprehensive test coverage  
✅ **Performance**: Uses sessionStorage for reliability  

## Browser Compatibility

- Requires `sessionStorage` support (available in all modern browsers)
- Falls back to URL parameters if sessionStorage fails
- Uses `router.replace()` to avoid back button issues