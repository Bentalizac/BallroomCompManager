# Re-Registration Implementation

## Overview
Successfully implemented the ability for users to re-register for events after cancelling their registration. The system now differentiates between active and withdrawn registrations, allowing users to reactivate their cancelled registrations seamlessly.

## Changes Made

### 1. Updated Registration Logic (`server/src/dal/eventRegistration.ts`)

#### Before:
- System checked for ANY existing registration (regardless of status)
- Prevented re-registration entirely if user had ever registered
- Cancelled registrations were permanent

#### After:
- System only checks for ACTIVE registrations
- Withdrawn/cancelled registrations can be reactivated
- Smart reactivation logic handles team registrations properly
- New dedicated `reactivateEventRegistration()` function

#### Key Changes:

**Modified `createEventRegistrationInternal()`:**
- Changed registration check to filter by `status === 'active'` only
- Added logic to detect withdrawn registrations
- Automatic reactivation when all participants have withdrawn registrations from same event
- Updated team name during reactivation if provided

**Modified `getUserEventRegistrations()`:**
- Added `.eq('status', 'active')` filter to only return active registrations
- Withdrawn registrations no longer appear in user's registration list

**Added `reactivateEventRegistration()`:**
- Dedicated function for reactivating withdrawn registrations
- Finds user's withdrawn registration for specific event
- Updates status to 'active' and optionally updates team name
- Returns complete registration data with participants

### 2. Updated tRPC Router (`server/src/trpc/routers/event.ts`)

#### Added New Endpoint:
```typescript
reactivateRegistration: authedProcedure
  .input(z.object({
    eventId: z.string().uuid(),
    teamName: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Reactivates withdrawn registration
  })
```

### 3. Updated Custom Hooks (`client/hooks/useEventRegistration.ts`)

#### Added Reactivation Support:
- `reactivateRegistrationMutation` - tRPC mutation for reactivation
- `reactivateRegistration()` function - easy-to-use async function
- Automatic cache invalidation after reactivation
- Consistent error handling with other registration operations

## User Experience Improvements

### Registration Flow:
1. **First Registration**: User registers for event normally
2. **Cancellation**: User cancels, registration status becomes 'withdrawn'
3. **UI Update**: Event no longer appears in user's active registrations
4. **Re-registration**: User can register again for same event
5. **Smart Reactivation**: System reactivates previous registration instead of creating duplicate

### Benefits:
- **Data Consistency**: Maintains registration history while allowing re-registration
- **No Duplicates**: Reuses existing registration records
- **Preserves Context**: Team names and participant roles are maintained
- **Clean UI**: Only active registrations show in user interface

## Technical Implementation Details

### Database Schema (No Changes Required)
The existing schema already supported this with the `status` field:
```sql
-- event_registrations table
status text default 'active' check (status in ('active', 'withdrawn', 'pending'))
```

### Registration Status Flow:
```
'active' ←→ 'withdrawn'
```
- New registrations: `'active'`
- Cancelled registrations: `'withdrawn'`
- Re-registrations: `'withdrawn'` → `'active'`

### API Endpoints:

#### Existing (Updated):
- `registerForEvent` - Now allows re-registration by checking only active registrations
- `getUserEventRegistrations` - Now filters to only active registrations
- `cancelEventRegistration` - Sets status to 'withdrawn' (unchanged)

#### New:
- `reactivateRegistration` - Dedicated endpoint for reactivating withdrawn registrations

### Error Handling:
- **Active Registration Exists**: "User already has an active registration for this event"
- **No Withdrawn Registration**: "No withdrawn registration found to reactivate"
- **Profile Incomplete**: Same as before - handled by existing logic

## Example Usage

### Individual Re-registration:
```typescript
// User cancels registration
await cancelEventRegistration(registrationId);

// Later, user re-registers (automatically reactivates)
await registerForEvent(eventId, 'competitor');
```

### Team Re-registration:
```typescript
// Team cancels registration
await cancelEventRegistration(registrationId);

// Later, team re-registers with updated team name
await createRegistration({
  eventId,
  participants: [
    { userId: user1Id, role: 'lead' },
    { userId: user2Id, role: 'follow' }
  ],
  teamName: 'New Team Name' // Updated team name
});
```

### Manual Reactivation:
```typescript
// Explicitly reactivate withdrawn registration
await reactivateRegistration(eventId, 'Updated Team Name');
```

## Testing Scenarios

### Successful Re-registration:
1. User registers for event → Active registration
2. User cancels → Withdrawn registration  
3. User registers again → Reactivated registration

### Team Re-registration:
1. Team registers → Active registration
2. Team cancels → Withdrawn registration
3. Team registers with new name → Reactivated with updated team name

### Edge Cases Handled:
- Multiple withdrawn registrations (uses most recent)
- Partial team re-registration (creates new registration if not all members)
- Registration after other users register (normal flow)

## Future Enhancements

1. **Registration History**: Add endpoint to view all registration history (including withdrawn)
2. **Batch Reactivation**: Support reactivating multiple registrations at once
3. **Notification System**: Notify users about successful reactivation
4. **Admin Controls**: Allow admins to reactivate registrations on behalf of users
5. **Time Limits**: Optional time limits for re-registration after cancellation

## Backward Compatibility

✅ **Fully Backward Compatible**
- All existing endpoints work unchanged
- No breaking changes to client code
- Database schema unchanged
- Existing registrations unaffected