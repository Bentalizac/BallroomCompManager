# Architecture Decision Record (ADR)

## 1. Title
Adopt Supabase for Authentication with JWT Token Verification

## 2. Status
- ✅ **Accepted** (Implemented)

## 3. Context
BallroomCompManager requires secure user authentication and authorization across client and server. Key requirements:

- **Authentication needs**: User signup, login, session management
- **Authorization needs**: Role-based access control (organizer, competitor, judge, spectator)
- **Security requirements**: Secure token verification, Row Level Security (RLS) policies
- **Database integration**: Tight coupling with Supabase PostgreSQL database
- **Client requirements**: Next.js 15 with App Router authentication flows
- **Server requirements**: Express.js backend with tRPC, must verify user identity

---

## 4. Decision
Implement **Supabase Auth** for user authentication with **JWT token verification** on the server:

### Architecture Components

#### Client (Next.js)
- **Package**: `@supabase/auth-helpers-nextjs` for Next.js integration
- **Session management**: Supabase client handles auth state and token refresh
- **Auth flow**: Login → Supabase Auth → Client receives JWT access token
- **Token transmission**: Bearer token sent in `Authorization` header to server

#### Server (Express + tRPC)
- **JWT Verification**: Server verifies Supabase JWT tokens using `@supabase/supabase-js`
- **Service Role Key**: Used for server-side token verification and admin operations
- **Context injection**: Verified user ID injected into tRPC context for all procedures
- **Client modes**: 
  - `getSupabaseAdmin()` - Service role for admin operations (bypasses RLS)
  - `getSupabaseAnon()` - Anonymous client for public operations (respects RLS)
  - `getSupabaseForUser()` - User-context client for authenticated operations (respects RLS with user context)

#### Database (Supabase PostgreSQL)
- **Row Level Security (RLS)**: Database-enforced access control
- **Auth schema**: Built-in `auth.users` table managed by Supabase
- **Custom tables**: `user_info`, `competition_participants`, `event_registrations`
- **Role enum consistency**: `participant_role` and `event_role` enums prevent string drift

### Authentication Flow
```
1. User logs in via client → Supabase Auth
2. Supabase returns JWT access token
3. Client stores token (handled by Supabase client)
4. Client makes tRPC call with Authorization: Bearer <token>
5. Server extracts token from header
6. Server verifies token with Supabase (verifySupabaseJWT)
7. Server extracts user ID from verified token
8. Server injects user ID into tRPC context
9. Procedures check context.userId for authorization
10. Database RLS policies enforce additional security
```

### Authorization Pattern
```typescript
// tRPC procedure with auth check
export const updateCompetition = authedProcedure
  .input(z.object({ competitionId: z.string(), /* ... */ }))
  .mutation(async ({ ctx, input }) => {
    // ctx.userId available from JWT verification
    const isAdmin = await isCompetitionAdmin(ctx.userId, input.competitionId);
    if (!isAdmin) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    // ... perform update
  });
```

---

## 5. Alternatives Considered

### Option A: Custom JWT Implementation (e.g., jsonwebtoken)
**Pros**: Full control, no vendor lock-in  
**Cons**: Must implement signup/login/password reset, security responsibility, no RLS integration  
**Verdict**: ❌ Rejected - Reinventing the wheel, high security risk

### Option B: NextAuth.js (Auth.js)
**Pros**: Flexible, supports multiple providers, popular  
**Cons**: Complex setup, requires separate user table management, doesn't integrate with Supabase RLS  
**Verdict**: ❌ Rejected - Poor integration with Supabase database

### Option C: Firebase Auth
**Pros**: Mature, well-documented, good DX  
**Cons**: Vendor lock-in to Google, separate from database, expensive at scale  
**Verdict**: ❌ Rejected - Already using Supabase for database

### Option D: Supabase Auth (Chosen)
**Pros**: Native integration with Supabase DB, built-in RLS support, JWT-based, handles auth flows  
**Cons**: Vendor lock-in to Supabase, migration complexity if switching providers  
**Verdict**: ✅ **Selected** - Best integration with existing Supabase database

---

## 6. Consequences

### Positive Effects
- ✅ **Zero auth boilerplate**: Supabase handles signup, login, password reset, email verification
- ✅ **Security by default**: JWT verification, bcrypt password hashing, RLS enforcement
- ✅ **Tight database integration**: Auth and data in same system, RLS uses auth.uid()
- ✅ **Token refresh**: Supabase client automatically refreshes expired tokens
- ✅ **Development velocity**: Focus on features, not auth infrastructure
- ✅ **Offline-first ready**: JWT tokens work without constant server verification

### Potential Tradeoffs
- ⚠️ **Vendor lock-in**: Migration away from Supabase requires rewriting auth layer
- ⚠️ **Token size**: JWTs can be large (affects request payload size)
- ⚠️ **Token expiry**: Must handle token refresh gracefully on client
- ⚠️ **RLS complexity**: Row Level Security policies require careful testing

### Impact on Future Features
- ✅ **Role-based access**: Easy to add new roles with enum expansion
- ✅ **Social auth**: Supabase supports OAuth providers (Google, GitHub, etc.)
- ✅ **Multi-tenancy**: RLS policies naturally support tenant isolation
- ⚠️ **Microservices**: Each service must verify JWT (requires sharing verification logic)

---

## 7. Implementation Notes

### Files/Modules Affected
```
client/
├── lib/
│   └── supabaseClient.ts          # Supabase client configuration
└── app/auth/                      # Auth pages (login, signup, etc.)

server/
├── src/
│   ├── auth/
│   │   └── jwt.ts                 # JWT verification logic
│   ├── dal/
│   │   └── supabase.ts            # Supabase client factories
│   ├── trpc/
│   │   └── base.ts                # tRPC context with userId
│   └── server.ts                  # Express middleware setup

Environment variables:
- SUPABASE_URL
- SUPABASE_ANON_KEY                # Public key for client
- SUPABASE_SERVICE_ROLE_KEY        # Private key for server
```

### JWT Verification Implementation
```typescript
// server/src/auth/jwt.ts
export async function verifySupabaseJWT(authHeader?: string): Promise<AuthResult | null> {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  
  return {
    userId: user.id,
    email: user.email,
    role: user.user_metadata?.role,
  };
}
```

### Required Migrations
1. ✅ Set up Supabase project with auth enabled
2. ✅ Configure environment variables (URL, anon key, service key)
3. ✅ Install client dependencies (`@supabase/auth-helpers-nextjs`)
4. ✅ Install server dependencies (`@supabase/supabase-js`, `jose` for JWT utils)
5. ✅ Implement JWT verification in server
6. ✅ Update tRPC context to include verified userId
7. ✅ Create RLS policies for user tables

### Dependencies
- **Client**: `@supabase/auth-helpers-nextjs@^0.10.0`, `@supabase/supabase-js@^2.57.4`
- **Server**: `@supabase/supabase-js@^2.45.4`, `jose@^5.9.3`

---

## 8. Related Decisions
- [ADR-001: Monorepo Architecture with Domain-Driven Design](./adr-001-monorepo-domain-types.md)
- [ADR-004: Row Level Security and Role-Based Access](./adr-004-rls-rbac.md)
- [Feature: Login Redirect System](../../client/docs/LOGIN_REDIRECTS.md)

---

## 9. Open Questions
- ✅ **Resolved**: How to handle token refresh? → Supabase client handles automatically
- ✅ **Resolved**: How to verify tokens server-side? → Use `supabase.auth.getUser(token)`
- ⚠️ **Open**: Should we add rate limiting on auth endpoints?
- ⚠️ **Open**: Should we implement session timeout in addition to token expiry?
- ⚠️ **Open**: How to handle auth in local development without internet?

---

## 10. Checklist
- [x] Team agrees on decision
- [x] Supabase project created
- [x] Environment variables configured
- [x] Client auth helpers installed and configured
- [x] Server JWT verification implemented
- [x] tRPC context includes userId
- [x] RLS policies created for protected tables
- [x] Auth flows tested (login, signup, logout)
- [x] Documentation updated (WARP.md)
- [ ] RAG embeddings refreshed ← **Next step**
