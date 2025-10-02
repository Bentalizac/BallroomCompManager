import { createClient } from '@supabase/supabase-js';

interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string;
  iss?: string;
}

interface AuthResult {
  userId: string;
  email?: string;
  role?: string;
}

// Create Supabase client for JWT verification
function getSupabaseForAuth() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Verify a Supabase JWT token and return user information
 */
export async function verifySupabaseJWT(authHeader?: string): Promise<AuthResult | null> {
  if (!authHeader) {
    console.log('🔐 JWT: No auth header provided');
    return null;
  }

  // Extract bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('🔐 JWT: Invalid auth header format:', authHeader.substring(0, 50));
    return null;
  }

  const token = parts[1];
  if (!token) {
    console.log('🔐 JWT: No token found in auth header');
    return null;
  }
  
  console.log('🔐 JWT: Token received, length:', token.length);

  try {
    console.log('🔐 JWT: Starting verification with Supabase client...');
    
    // Create Supabase client with service role key
    const supabase = getSupabaseForAuth();
    
    // Use Supabase to verify the JWT and get user
    console.log('🔐 JWT: Verifying token with Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('🔐 JWT: Supabase auth error:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('🔐 JWT: No user found in token');
      return null;
    }
    
    console.log('🔐 JWT: Verification successful, user:', user.id);
    
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Log the error with more details for debugging
    console.error('🔐 JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return null;
  }
}

/**
 * Development helper - allows requests without auth when NODE_ENV=development
 * Use with caution and only for local development
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Extract user ID from various sources for development flexibility
 */
export async function extractUserId(authHeader?: string): Promise<string | null> {
  const authResult = await verifySupabaseJWT(authHeader);
  return authResult?.userId || null;
}
