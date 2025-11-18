# Feature Design Document

## 1. Feature Summary
**Purpose:**  
Event registration system allowing competitors to register for competition events with support for team entries, multiple participants per entry, and role-based participation (lead, follow, coach, member).

**Primary Goals:**  
- Enable users to register for competition events
- Support team-based registrations with multiple participants
- Track registration status (active, withdrawn, pending)
- Provide type-safe API for registration operations
- Support different participant roles within an entry

**Status:**  
- ✅ **Completed** (Core implementation)
- ⚠️ **In Progress** (Payment integration, advanced features)

---

## 2. Context & Motivation
Ballroom competitions require tracking which competitors are registered for which events. The system must handle:

**Current system needs:**  
- Solo and team competition entries
- Different dance partner roles (lead/follow)
- Coach registrations for pro-am events
- Group/formation team members
- Registration withdrawals and status tracking

**Pain points addressed:**  
- Manual registration tracking by organizers (from VOC.md)
- Air gap between registration forms and competition software
- Difficulty updating registrations
- Costume change conflict detection (future enhancement)

---

## 3. Affected Components

### Server
- **Supabase queries impacted**: 
  - `event_registrations` table (new queries)
  - `event_registration_participants` table (new queries)
  - `user_info` table (joins for user details)
- **New tables**: 
  - `event_registrations` - Main registration entries
  - `event_registration_participants` - Participants within each entry
- **API routes added or modified**:
  - `event.registerForEvent` - Create new registration
  - `event.getUserEventRegistrations` - Get user's registrations
  - `event.cancelEventRegistration` - Withdraw from event
  - `competition.getEventRegistrations` - Get all registrations for competition
- **Business logic changes**:
  - Registration validation (team size, role requirements)
  - Status management (active, withdrawn, pending)

### Shared
- **Domain types added/modified**:
  - `EventRegistration` (legacy interface)
  - `EventRegistrationEntry` (new registration model)
  - `EventRegistrationParticipant` (participant within entry)
  - `EventRegistrationApi` (API transport type)
- **Interfaces updated**:
  - Added `participants` array to registration model
  - Added `teamName` optional field
  - Added `status` enum for registration lifecycle
- **Mapping logic impacted**:
  - Database row → Domain object transformations in server mappers

### Client
- **UI views added or updated**:
  - Event registration forms
  - Registration management views
  - Team member selection UI
  - Registration status displays
- **Type usage changes**:
  - Import `EventRegistrationApi` from shared package
  - Use tRPC typed clients for registration operations
- **New service functions**:
  - Registration form submission handlers
  - Status update workflows

---

## 4. Data Model Changes

### Database Schema Changes (Supabase)

#### `event_registrations` Table
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES comp_events(id) ON DELETE CASCADE,
  team_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `event_registration_participants` Table
```sql
CREATE TABLE event_registration_participants (
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('lead', 'follow', 'coach', 'member')),
  PRIMARY KEY (registration_id, user_id)
);
```

#### Indexes
```sql
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
CREATE INDEX idx_registration_participants_user ON event_registration_participants(user_id);
```

### Domain Types (Shared Project)

```typescript
// New registration model
export interface EventRegistrationEntry {
  id: string;
  eventId: string;
  teamName?: string;
  status: 'active' | 'withdrawn' | 'pending';
  createdAt: Date;
  participants: EventRegistrationParticipant[];
}

export interface EventRegistrationParticipant {
  registrationId: string;
  userId: string;
  role: 'lead' | 'follow' | 'coach' | 'member';
}

// API transport type (dates as ISO strings)
export interface EventRegistrationApi {
  id: string;
  eventId: string;
  teamName?: string;
  status: 'active' | 'withdrawn' | 'pending';
  createdAt: string;
  participants: {
    userId: string;
    role: 'lead' | 'follow' | 'coach' | 'member';
    userInfo?: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }[];
}
```

---

## 5. API Design

### `event.registerForEvent`
- **Method:** Mutation
- **Auth:** Required (authedProcedure)
- **Request shape:**
  ```typescript
  {
    eventId: string;
    participants: {
      userId: string;
      role: 'lead' | 'follow' | 'coach' | 'member';
    }[];
    teamName?: string;
  }
  ```
- **Response shape:** `EventRegistrationApi`
- **Errors:**
  - `UNAUTHORIZED` - Not authenticated
  - `BAD_REQUEST` - Invalid participant data or role combinations
  - `CONFLICT` - Already registered for event
- **Notes:** Validates that at least one participant is provided

### `event.getUserEventRegistrations`
- **Method:** Query
- **Auth:** Required (authedProcedure)
- **Request shape:**
  ```typescript
  {
    competitionId: string;
  }
  ```
- **Response shape:** `EventRegistrationApi[]`
- **Errors:**
  - `UNAUTHORIZED` - Not authenticated
- **Notes:** Returns registrations for current user across all events in competition

### `event.cancelEventRegistration`
- **Method:** Mutation
- **Auth:** Required (authedProcedure)
- **Request shape:**
  ```typescript
  {
    registrationId: string;
  }
  ```
- **Response shape:** `{ success: boolean }`
- **Errors:**
  - `UNAUTHORIZED` - Not authenticated
  - `FORBIDDEN` - User not part of registration
  - `NOT_FOUND` - Registration doesn't exist
- **Notes:** Sets status to 'withdrawn' rather than deleting

### `competition.getEventRegistrations`
- **Method:** Query
- **Auth:** Public (may require organizer role in future)
- **Request shape:**
  ```typescript
  {
    competitionId: string;
  }
  ```
- **Response shape:** `EventRegistrationApi[]`
- **Errors:** None (returns empty array if no registrations)
- **Notes:** Returns all registrations across all events in competition

---

## 6. Interaction Flow

### Registration Creation
```
1. User navigates to event detail page
2. User clicks "Register for Event" button
3. Client displays registration form
4. User selects participants and assigns roles
5. User optionally enters team name
6. User submits form
7. Client sends tRPC mutation: event.registerForEvent
8. Server validates auth token (authedProcedure)
9. Server validates participant data (at least one participant)
10. Server inserts row into event_registrations table
11. Server inserts rows into event_registration_participants table
12. Server queries joined data with user info
13. Server maps DB rows → EventRegistrationApi
14. Server returns registration to client
15. Client updates UI with success message
16. Client refetches user's registrations (react-query cache invalidation)
```

### Registration Viewing
```
1. User navigates to "My Registrations" page
2. Client calls tRPC query: event.getUserEventRegistrations
3. Server queries event_registrations joined with:
   - event_registration_participants
   - user_info (for participant names)
4. Server filters by user_id in participants
5. Server maps results to EventRegistrationApi[]
6. Client displays registrations grouped by event
```

### Registration Cancellation
```
1. User clicks "Withdraw" on registration
2. Client confirms action with dialog
3. Client sends tRPC mutation: event.cancelEventRegistration
4. Server verifies user is participant in registration
5. Server updates registration status to 'withdrawn'
6. Server returns success
7. Client invalidates registrations query cache
8. Client refetches updated data
9. UI updates to show withdrawn status
```

---

## 7. Edge Cases & Constraints

### Registration Rules
- At least one participant required per registration
- User can be in multiple registrations for same event (e.g., dancing with different partners)
- Withdrawn registrations preserved for historical record
- Team name optional (used for formation teams, optional for couples)

### Role Constraints
- **Lead/Follow**: Traditional ballroom dance roles
- **Coach**: For pro-am events (professional dancing with student)
- **Member**: For formation/group teams with no role distinction

### Data Integrity
- Foreign key constraints ensure registrations deleted when event deleted
- Cascade delete removes participants when registration deleted
- User deletion handled by auth.users cascade rules

### Performance Considerations
- Indexes on event_id and user_id for fast queries
- Joins limited to necessary fields (firstname, lastname, email)
- Status filtering prevents showing withdrawn registrations by default

---

## 8. Migration Plan

### Initial Migration
1. ✅ Create `event_registrations` table
2. ✅ Create `event_registration_participants` table
3. ✅ Add indexes for performance
4. ✅ Create RLS policies for access control

### Future Enhancements
- ⚠️ Add payment tracking (payment_status, amount_paid)
- ⚠️ Add registration deadlines (registration_deadline column)
- ⚠️ Add costume change conflict detection
- ⚠️ Add waitlist support (status: 'waitlisted')

---

## 9. Test Strategy

### Unit Tests
- Domain type validation (Zod schemas)
- Mapper functions (DB row → Domain object)
- Role validation logic

### Integration Tests
- Registration creation with single participant
- Registration creation with multiple participants
- Registration retrieval with joins
- Registration cancellation flow
- Authorization checks (user can only cancel own registrations)

### Manual / UI Tests
- Register for event as solo competitor
- Register for event with partner (lead/follow roles)
- Register formation team with 8+ members
- View registrations across multiple events
- Withdraw from event and verify status change
- Verify withdrawn registrations don't show in active counts

---

## 10. Open Questions
- ✅ **Resolved**: Should we soft-delete or hard-delete? → Soft delete with status='withdrawn'
- ✅ **Resolved**: How to handle partner selection? → Separate participant selector UI
- ⚠️ **Open**: Should we add registration edit capability?
- ⚠️ **Open**: How to handle registration fees and payment tracking?
- ⚠️ **Open**: Should we limit registrations per event (capacity)?
- ⚠️ **Open**: How to handle age/level verification for restricted events?

---

## 11. Final Checklist
- [x] Domain types updated (`shared/data/types/registration.ts`)
- [x] Database schema created (migration complete)
- [x] Server logic updated (tRPC routers)
- [x] API routes added (`routers/event.ts`, `routers/competition.ts`)
- [x] Client views updated (registration forms, status displays)
- [x] Mappers updated (DB → Domain transformations)
- [ ] Tests implemented (placeholder, needs unit/integration tests)
- [ ] Docs updated (this document)
- [ ] RAG embeddings refreshed ← **Next step**

---

## Related Documentation
- [ADR-001: Monorepo Architecture](./adr-001-monorepo-domain-types.md) - Type system and shared package
- [ADR-003: Supabase Authentication](./adr-003-supabase-auth-jwt.md) - Auth requirements
- [VOC.md](../../docs/VOC.md) - User pain points and requirements
