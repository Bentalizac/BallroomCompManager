# Architecture Decision Record (ADR)

## 1. Title
Adopt Monorepo Architecture with Domain-Driven Design for Shared Types

## 2. Status
- ✅ **Accepted** (Implemented)

## 3. Context
BallroomCompManager requires type safety across both client and server applications. The problem areas include:

- **Current architecture limitations**: Type drift between frontend and backend leads to runtime errors
- **Team goals**: Maintain end-to-end type safety from database to UI
- **External requirements**: TypeScript as the primary language, Supabase as database provider
- **Constraints**: Small team requiring efficient development workflow with minimal maintenance overhead

Without shared types, the client and server would duplicate type definitions, leading to inconsistencies when the data model evolves.

---

## 4. Decision
Implement a **monorepo using pnpm workspaces** with three distinct packages:

### Package Architecture
- **`shared/`**: Source of truth for all domain types, enums, utilities, and Zod schemas
- **`server/`**: Express.js backend with tRPC, handles database mapping and business logic
- **`client/`**: Next.js 15 frontend with React 19, consumes tRPC API with full type safety

### Key Design Patterns
- **Domain-Driven Design**: Domain models live in `shared/` package and are imported by both client and server
- **Type-Safe API Layer**: tRPC provides type-safe RPC calls with zero code generation
- **Database Mapping**: Server maps Supabase database rows to domain types before sending to client
- **Single Source of Truth**: All enums, interfaces, and utilities defined once in `shared/`

### Technology Stack
- **Monorepo**: pnpm workspaces for dependency management
- **Type System**: TypeScript 5+ with strict mode
- **API Protocol**: tRPC 11 for type-safe client-server communication
- **Validation**: Zod schemas for runtime type checking and API validation

---

## 5. Alternatives Considered

### Option A: Separate Repositories with Duplicated Types
**Pros**: Independent deployment, clear boundaries  
**Cons**: Type drift, manual synchronization, duplicated code, higher maintenance burden  
**Verdict**: ❌ Rejected due to maintenance overhead for small team

### Option B: GraphQL with Code Generation
**Pros**: Industry standard, rich ecosystem, strong tooling  
**Cons**: Requires code generation step, schema definition language overhead, complexity for simple CRUD  
**Verdict**: ❌ Rejected as overkill for project scope

### Option C: REST API with OpenAPI/Swagger
**Pros**: Well-known pattern, language-agnostic  
**Cons**: Requires schema generation, no compile-time type safety, manual client SDK updates  
**Verdict**: ❌ Rejected due to lack of TypeScript-native type safety

### Option D: Monorepo with tRPC (Chosen)
**Pros**: Zero code generation, compile-time type safety, minimal boilerplate, TypeScript-native  
**Cons**: TypeScript-only, smaller ecosystem than GraphQL/REST  
**Verdict**: ✅ **Selected** - Best fit for TypeScript-first team with type safety requirements

---

## 6. Consequences

### Positive Effects
- ✅ **End-to-end type safety**: Types flow from database → server → client with compile-time checks
- ✅ **Zero code generation**: No build step for API types, changes propagate automatically
- ✅ **Single source of truth**: Domain models defined once, used everywhere
- ✅ **Improved maintainability**: Refactoring types updates all consumers automatically
- ✅ **Better DX**: IntelliSense, autocomplete, and type checking in IDE
- ✅ **Reduced bugs**: Type mismatches caught at compile time, not runtime

### Potential Tradeoffs
- ⚠️ **Learning curve**: Team must understand tRPC and monorepo patterns
- ⚠️ **TypeScript lock-in**: Cannot easily add non-TypeScript services
- ⚠️ **Build coordination**: Must build `shared/` before building dependent packages
- ⚠️ **Initial complexity**: Setup requires understanding pnpm workspaces and package references

### Impact on Future Features
- ✅ Adding new endpoints: Automatic type propagation to client
- ✅ Schema changes: TypeScript compiler catches breaking changes
- ⚠️ Third-party integrations: May require adapter layer if not TypeScript-based

---

## 7. Implementation Notes

### Files/Modules Affected
```
BallroomCompManager/
├── pnpm-workspace.yaml          # Workspace configuration
├── shared/
│   ├── package.json             # Shared types package
│   ├── index.ts                 # Main exports
│   ├── data/
│   │   ├── types/               # Domain models (User, Competition, Event, etc.)
│   │   ├── enums/               # Shared enums (roles, scoring methods, etc.)
│   │   └── requestSchemas/      # Zod validation schemas
│   └── utils/                   # Shared utilities (slugs, etc.)
├── server/
│   ├── package.json             # Depends on @ballroomcompmanager/shared
│   └── src/
│       ├── trpc/router.ts       # tRPC router exports AppRouter type
│       └── dal/supabase.ts      # Database access layer
└── client/
    ├── package.json             # Depends on @ballroomcompmanager/shared
    └── lib/trpc.ts              # tRPC client imports AppRouter type
```

### Required Migrations
1. ✅ Create `pnpm-workspace.yaml` with workspace definitions
2. ✅ Extract shared types from server/client into `shared/` package
3. ✅ Update import paths in server and client to use `@ballroomcompmanager/shared`
4. ✅ Configure tRPC router in server and client

### Dependencies to Install
- **Workspace**: `pnpm` (v10.15.1+)
- **Shared**: `zod@^4.1.8`, `typescript@^5.9.2`
- **Server**: `@trpc/server@^11.5.1`, `@ballroomcompmanager/shared` (workspace)
- **Client**: `@trpc/client@^11.5.1`, `@trpc/react-query@^11.5.1`, `@ballroomcompmanager/shared` (workspace)

---

## 8. Related Decisions
- [ADR-002: tRPC Router Modular Structure](./adr-002-trpc-modular-structure.md)
- [ADR-003: Supabase Authentication with JWT](./adr-003-supabase-auth-jwt.md)
- [Feature Doc: Login Redirect System](../client/docs/LOGIN_REDIRECTS.md)

---

## 9. Open Questions
- ✅ **Resolved**: How to handle database type generation? → Using Supabase CLI to generate types
- ✅ **Resolved**: Build order dependencies? → `shared` must build before `server`/`client`, enforced by pnpm
- ⚠️ **Open**: Should we add schema versioning for API compatibility?
- ⚠️ **Open**: How to handle breaking changes in shared types during deployment?

---

## 10. Checklist
- [x] Team agrees on decision
- [x] Monorepo structure implemented
- [x] Shared package created with domain types
- [x] tRPC configured in server and client
- [x] Build scripts updated (`build:shared`, `dev:client`, `dev:server`)
- [x] Documentation updated (WARP.md)
- [ ] RAG embeddings refreshed ← **Next step**
