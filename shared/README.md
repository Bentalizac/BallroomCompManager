# @listit/shared

Shared TypeScript types and enums for the ListIt application.

## Available Types

### User Types
- `User` - Basic user information
- `Participant` - User information relative to a specific event
- `BallroomCompetitor` - Extended competitor information for ballroom events

### Competition Types
- `Competition` - Competition information with events
- `CompEvent` - Individual competition event

### Enums
- `CompetitionRole` - User roles in competitions (Organizer, Staff, Judge, Competitor, Audience)
- `ScoringMethods` - Available scoring methods for events

## Usage

### In Client (Next.js)
```typescript
import { User, CompetitionRole, CompEvent } from '@listit/shared';

const user: User = {
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
};
```

### In Server
```typescript
import { Participant, ScoringMethods } from '@listit/shared';

const participant: Participant = {
  id: '456',
  userId: '123',
  competitionId: '789',
  eventId: '101',
  role: CompetitionRole.Competitor
};
```

## Development

### Build the package
```bash
npm run build
```

### Watch for changes
```bash
npm run build:watch
```

### Clean build directory
```bash
npm run clean
```

## Structure

```
shared/
├── package.json
├── tsconfig.json
├── index.ts          # Main exports
├── data/
│   ├── types/         # Type definitions
│   │   ├── user.ts
│   │   ├── competition.ts
│   │   ├── event.ts
│   │   └── userExtensions.ts
│   └── enums/         # Enum definitions
│       ├── roles.ts
│       └── scoringMethods.ts
└── dist/              # Compiled output
```
