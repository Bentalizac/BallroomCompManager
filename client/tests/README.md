# Authentication Tests

This directory contains comprehensive unit tests for the authentication system in BallroomCompManager.

## 📋 Test Structure

### 🔧 Auth Service Tests (`services/auth/__tests__/auth.test.ts`)
**19 tests covering all authentication service methods**

**✅ Tests Passing:** 19/19

#### Sign Up Tests (3 tests)
- ✅ Successfully sign up a user
- ✅ Handle sign up errors (invalid email, existing user)
- ✅ Handle network/unexpected errors

#### Sign In Tests (3 tests)
- ✅ Successfully sign in a user
- ✅ Handle invalid credentials
- ✅ Handle empty credentials

#### Sign Out Tests (3 tests)
- ✅ Successfully sign out a user
- ✅ Handle sign out errors
- ✅ Handle network errors during sign out

#### Session Management Tests (3 tests)
- ✅ Successfully get current session
- ✅ Handle no active session
- ✅ Handle session retrieval errors

#### User Management Tests (3 tests)
- ✅ Successfully get current user
- ✅ Handle no current user
- ✅ Handle user retrieval errors

#### Auth State Change Tests (2 tests)
- ✅ Set up auth state change listener
- ✅ Allow callback to be called with auth events

#### Interface Compliance Tests (2 tests)
- ✅ Implement all required methods
- ✅ Proper TypeScript interface adherence

### 🔧 Auth Provider Tests (`providers/auth/__tests__/authProvider.test.tsx`)
**Component integration tests for React auth context**

**Tests Include:**
- Initialization with and without existing session
- Auth state changes (sign in/out events)
- Error handling for all auth operations
- Loading states management
- Context cleanup on unmount

### 🔧 Auth Form Tests (`components/auth/__tests__/authForm.test.tsx`)
**End-to-end component tests for authentication UI**

**Tests Include:**
- Form rendering and mode switching
- Form validation
- Sign in/up functionality
- Loading states
- Error handling
- Accessibility compliance

## 🚀 Running Tests

### Quick Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run auth-specific tests only
pnpm test -- services/auth/__tests__/auth.test.ts
```

### Test Script
```bash
# Run comprehensive auth test suite
bash scripts/test.sh
```

## 📊 Test Coverage

The authentication tests provide coverage for:

### ✅ Auth Service Layer
- All CRUD operations for authentication
- Error handling for network failures
- Proper mocking of Supabase client
- Type safety validation

### ✅ Auth Provider Layer  
- React context state management
- Integration with auth service
- Error boundaries and loading states
- Component lifecycle management

### ✅ Auth Form Layer
- User interface interactions
- Form validation
- Visual feedback (loading, errors, success)
- Accessibility compliance

## 🔍 Test Patterns

### Mocking Strategy
```typescript
// Mock Supabase client completely
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      // ... other methods
    },
  },
}));
```

### Async Testing
```typescript
// Proper async testing with waitFor
await waitFor(() => {
  expect(mockedAuthService.signIn).toHaveBeenCalledWith(
    'test@example.com', 
    'password123'
  );
});
```

### Error Testing
```typescript
// Test both resolved errors and rejected promises
mockedAuthService.signIn.mockResolvedValue({
  data: { user: null, session: null },
  error: { message: 'Invalid credentials' },
});

mockedAuthService.signIn.mockRejectedValue(new Error('Network error'));
```

## 🛡️ Benefits

### Future Change Verification
- Any changes to auth service methods are automatically tested
- Regression detection for UI components
- API contract validation

### Confidence in Deployment
- 100% auth flow coverage
- Edge case handling verified  
- Error scenarios tested

### Development Speed
- Fast feedback on auth changes
- Easy debugging with detailed test output
- Safe refactoring with test safety net

## 📝 Adding New Tests

### For New Auth Service Methods
1. Add to `services/auth/__tests__/auth.test.ts`
2. Mock Supabase responses
3. Test success, error, and edge cases

### For New UI Components
1. Create test file in `__tests__` directory
2. Mock auth service dependencies
3. Test rendering, interactions, and accessibility

### Example Test Structure
```typescript
describe('NewAuthFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
  });

  describe('happy path', () => {
    it('should work correctly', async () => {
      // Test implementation
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      // Test implementation  
    });
  });
});
```

## 🎯 Testing Philosophy

**Fast:** Unit tests run in milliseconds
**Reliable:** Deterministic results with proper mocking
**Comprehensive:** Cover success, failure, and edge cases
**Maintainable:** Clear test structure and naming
**Realistic:** Mirror actual usage patterns