# Feature Design Document

## 1. Feature Summary
**Purpose:**  
Short description of what this feature does and why it exists.

**Primary Goals:**  
- Goal A  
- Goal B  
- Goal C  

**Status:**  
- Proposed / In Progress / Completed

---

## 2. Context & Motivation
Explain the problem this feature solves. Include relevant background on current system behavior.

**Example points:**  
- Limitations in current design  
- Known bugs or edge cases  
- Related tickets or future planned work  

---

## 3. Affected Components
List all parts of the monorepo that will be impacted.

### Server
- Supabase queries impacted  
- New tables or schema updates  
- API routes added or modified  
- Business logic changes  

### Shared
- Domain types added/modified  
- Interfaces updated  
- Mapping logic impacted  

### Client
- UI views added or updated  
- Type usage changes  
- New service functions  

---

## 4. Data Model Changes

### Database Schema Changes (Supabase)
- Tables added  
- Tables modified  
- New columns  
- Column type changes  
- Constraints, indexes, relationships  

### Domain Types (Shared Project)
- Existing types that change  
- New types/interfaces  
- Mapping considerations (DB ↔ Domain ↔ DTO)  

Include pseudocode or example types if helpful.

---

## 5. API Design
For each relevant endpoint:

### Endpoint Name
- **Route:**  
- **Method:**  
- **Auth:**  
- **Request shape:**  
- **Response shape:**  
- **Errors:**  
- **Notes:**  

---

## 6. Interaction Flow
Describe how the components interact. Examples:

> Client → Server (route X) → Supabase (table Y) → Server Domain Layer → Client state update.

Or as bullets:

1. User performs action  
2. Client sends request  
3. Server validates  
4. Server queries Supabase  
5. Server maps DB → Domain  
6. Server replies with domain object  
7. Client updates state/UI  

---

## 7. Edge Cases & Constraints
List any special conditions or rules:

- Race conditions  
- Permission mismatches  
- Cached client state  
- Handling deleted rows  
- Multi-tenant concerns  
- Input validation rules  

---

## 8. Migration Plan
Describe steps for safe migration:

- One-time migrations  
- Backward compatibility  
- Deprecation notes  

---

## 9. Test Strategy

### Unit Tests
- Domain mapping  
- Local business logic  

### Integration Tests
- Server ↔ Supabase  
- Client ↔ Server  

### Manual / UI Tests
- Basic interaction flow  
- Edge cases  

---

## 10. Open Questions
Optional points for discussion:

- Should DTOs include nullable fields?  
- Should the client cache this?  
- Should this be one endpoint or two?  

---

## 11. Final Checklist
Useful both for humans and RAG indexing:

- [ ] Domain types updated  
- [ ] Database schema updated  
- [ ] Server logic updated  
- [ ] API routes updated  
- [ ] Client views updated  
- [ ] Mappers updated  
- [ ] Tests implemented  
- [ ] Docs updated  
- [ ] RAG embeddings refreshed
