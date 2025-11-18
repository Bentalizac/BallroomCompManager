# BallroomCompManager Design Documentation

This directory contains consolidated design documentation for the BallroomCompManager project, organized using standardized templates for Architecture Decision Records (ADRs) and Feature Design Documents.

## 📋 Documentation Index

### Architecture Decision Records (ADRs)

ADRs document key architectural decisions, the context that led to them, alternatives considered, and their consequences.

| Document | Status | Summary |
|----------|--------|---------|
| [ADR-001: Monorepo Architecture with Domain-Driven Design](./adr-001-monorepo-domain-types.md) | ✅ Implemented | pnpm workspace monorepo with shared types package, tRPC for type-safe API |
| [ADR-002: tRPC Router Modular Structure](./adr-002-trpc-modular-structure.md) | ✅ Implemented | Domain-based router organization with separation of concerns |
| [ADR-003: Supabase Authentication with JWT](./adr-003-supabase-auth-jwt.md) | ✅ Implemented | JWT token verification, RLS policies, role-based access control |

### Feature Design Documents

Feature docs describe implemented features, their data models, API designs, and interaction flows.

| Document | Status | Summary |
|----------|--------|---------|
| [Feature: Login Redirect System](./feature-login-redirects.md) | ✅ Completed | Intelligent post-auth redirects with pattern matching |
| [Feature: Event Registration System](./feature-event-registration.md) | ✅ Core Complete | Team-based event registrations with multi-participant support |

## 🎯 Documentation Purpose

These documents serve multiple audiences:

1. **Developers** - Understand architectural decisions and implementation patterns
2. **AI Assistants** - RAG system indexes these docs for contextual code assistance
3. **Collaborators** - Onboarding reference for new team members
4. **Future Self** - Document "why" decisions were made, not just "what"

## 📝 Using the Templates

When creating new documentation, use the templates in `../doc_templates/`:

- **`adr-template.md`** - For architectural decisions (framework choices, design patterns, tech stack)
- **`feature-template.md`** - For new features (data models, APIs, user flows)
- **`refactor-template.md`** - For significant refactoring efforts

## 🔍 RAG Integration

All documentation in this directory is automatically indexed by the RAG (Retrieval-Augmented Generation) system. After adding or updating docs:

```bash
# Re-index the RAG system
cd rag/tools
python rag_service.py
# Or use the MCP tool: rag_ingest with force_rebuild: true
```

The RAG system enables semantic search across documentation:
```typescript
// Example query via MCP
rag_query({
  query: "How does authentication work?",
  type_filter: "design",
  top_k: 5
})
```

## 📚 Related Documentation

- **[../schema/](../schema/)** - Database schema documentation
- **[../project-structure/](../project-structure/)** - High-level architecture overview
- **[../../WARP.md](../../WARP.md)** - Development workflow and commands
- **[../../docs/VOC.md](../../docs/VOC.md)** - Voice of Customer, user pain points
- **[../../client/docs/](../../client/docs/)** - Client-specific documentation
- **[../../server/src/trpc/README.md](../../server/src/trpc/README.md)** - tRPC router structure

## 🚀 Quick Links

### Key Architectural Concepts
- **Monorepo Structure**: See ADR-001
- **Type Safety**: Shared types in `shared/` package (ADR-001)
- **API Layer**: tRPC with modular routers (ADR-002)
- **Authentication**: Supabase JWT verification (ADR-003)
- **Database**: Supabase PostgreSQL with Row Level Security (ADR-003)

### Implementation Patterns
- **Database → Domain Mapping**: Server transforms DB rows to domain types
- **Domain → API Mapping**: Domain types exported from `shared/` package
- **Client API Calls**: tRPC React Query hooks with full type inference
- **Authorization**: JWT context + RLS policies (defense in depth)

## 🔄 Documentation Workflow

1. **Plan** - Use appropriate template for the type of change
2. **Write** - Fill out template sections with design details
3. **Review** - Have team review and discuss open questions
4. **Implement** - Build the feature/change
5. **Update** - Mark sections as complete, update status
6. **Index** - Re-run RAG ingestion to make docs searchable

## 📊 Documentation Coverage

Current coverage by domain:

- ✅ **Architecture**: Monorepo, tRPC, Auth, RLS
- ✅ **Features**: Login redirects, Event registration
- ⚠️ **In Progress**: Payment integration, Results publishing, Scheduling
- ⚠️ **Planned**: Judging system, Heat generation, Costume change detection

## 💡 Tips for Writing Good Documentation

1. **Context is King**: Explain *why* decisions were made, not just *what*
2. **Alternatives Matter**: Document options considered and why they were rejected
3. **Be Specific**: Include code examples, file paths, and concrete details
4. **Think Future**: What will confuse someone reading this in 6 months?
5. **Update Status**: Mark docs as Proposed → In Progress → Completed
6. **Link Liberally**: Connect related docs and decisions

## 🎓 Learning Path

For new developers joining the project:

1. Start with [project-structure/overview.md](../project-structure/overview.md) for high-level architecture
2. Read [ADR-001](./adr-001-monorepo-domain-types.md) to understand the monorepo and type system
3. Review [ADR-002](./adr-002-trpc-modular-structure.md) for API structure
4. Understand [ADR-003](./adr-003-supabase-auth-jwt.md) for auth patterns
5. Explore feature docs to see how concepts are applied in practice
6. Reference [WARP.md](../../WARP.md) for development commands

---

**Last Updated**: 2025-11-18  
**RAG Index Status**: ✅ Up to date
