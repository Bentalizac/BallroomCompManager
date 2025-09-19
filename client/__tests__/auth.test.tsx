import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/providers/auth/authProvider';
import authService from '@/services/auth/auth';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Mock the auth service
jest.mock('@/services/auth/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentSession: jest.fn(),
  onAuthStateChange: jest.fn(),
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Mock data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
} as User;

const mockSession: Session = {
  access_token: 'token-123',
  refresh_token: 'refresh-123',
  user: mockUser,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
} as Session;

const mockUnsubscribe = jest.fn();

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks - clean state
    mockedAuthService.getCurrentSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockedAuthService.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    });
  });

  const renderAuthProvider = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });
  };

  describe('initial state', () => {
    it('should start with no user if getCurrentSession returns null', async () => {
      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
      expect(mockedAuthService.getCurrentSession).toHaveBeenCalledTimes(1);
    });

    it('should load the user if getCurrentSession returns a valid session', async () => {
      mockedAuthService.getCurrentSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(mockedAuthService.getCurrentSession).toHaveBeenCalledTimes(1);
    });

    it('should leave user null if getCurrentSession returns an error', async () => {
      mockedAuthService.getCurrentSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
      expect(mockedAuthService.getCurrentSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct arguments', async () => {
      mockedAuthService.signIn.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockedAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should set user state when sign in succeeds', async () => {
      mockedAuthService.signIn.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should not set user and expose error when sign in fails', async () => {
      const signInError = { message: 'Invalid credentials' };
      mockedAuthService.signIn.mockResolvedValue({
        data: null,
        error: signInError,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });

      expect(result.current.user).toBeNull();
      expect(signInResult).toEqual({ data: null, error: signInError });
    });
  });

  describe('signUp', () => {
    it('should call authService.signUp with correct arguments', async () => {
      mockedAuthService.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123');
      });

      expect(mockedAuthService.signUp).toHaveBeenCalledWith('new@example.com', 'password123');
    });

    it('should set user state when sign up succeeds', async () => {
      mockedAuthService.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should not set user and expose error when sign up fails', async () => {
      const signUpError = { message: 'Email already registered' };
      mockedAuthService.signUp.mockResolvedValue({
        data: null,
        error: signUpError,
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('existing@example.com', 'password123');
      });

      expect(result.current.user).toBeNull();
      expect(signUpResult).toEqual({ data: null, error: signUpError });
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      // Start with a signed-in user for signOut tests
      mockedAuthService.getCurrentSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    it('should call authService.signOut', async () => {
      mockedAuthService.signOut.mockResolvedValue({ error: null });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockedAuthService.signOut).toHaveBeenCalledTimes(1);
    });

    it('should clear user state when sign out succeeds', async () => {
      mockedAuthService.signOut.mockResolvedValue({ error: null });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
    });

    it('should clear user even if sign out fails', async () => {
      // Note: Current implementation always clears user, even on signOut errors
      // This behavior could be improved to preserve user state on failed signOut
      mockedAuthService.signOut.mockResolvedValue({ 
        error: { message: 'Network error' } 
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      // Current implementation clears user regardless of signOut error
      expect(result.current.user).toBeNull();
    });
  });

  describe('auth state changes', () => {
    it('should update user when SIGNED_IN event is received', async () => {
      let authStateCallback: (event: AuthChangeEvent, session: Session | null) => void;
      
      mockedAuthService.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        };
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      act(() => {
        authStateCallback!('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should clear user when SIGNED_OUT event is received', async () => {
      let authStateCallback: (event: AuthChangeEvent, session: Session | null) => void;
      
      // Start with signed-in user
      mockedAuthService.getCurrentSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      mockedAuthService.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        };
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      act(() => {
        authStateCallback!('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
    });

    it('should ignore invalid or malformed session data', async () => {
      let authStateCallback: (event: AuthChangeEvent, session: Session | null) => void;
      
      mockedAuthService.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        };
      });

      const { result } = renderAuthProvider();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      // Test invalid session (missing user)
      act(() => {
        authStateCallback!('SIGNED_IN', { ...mockSession, user: undefined } as any);
      });

      expect(result.current.user).toBeNull();

      // Test malformed session (null when SIGNED_IN)
      act(() => {
        authStateCallback!('SIGNED_IN', null);
      });

      expect(result.current.user).toBeNull();
    });

    it('should unsubscribe from auth state changes on unmount', () => {
      const { unmount } = renderAuthProvider();
      
      expect(mockedAuthService.onAuthStateChange).toHaveBeenCalledTimes(1);
      
      unmount();
      
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
