import { getPostAuthRedirect } from '@/lib/redirects';

describe('getPostAuthRedirect', () => {
  it('should return default path when no origin path is provided', () => {
    expect(getPostAuthRedirect()).toBe('/home');
    expect(getPostAuthRedirect(null)).toBe('/home');
    expect(getPostAuthRedirect('')).toBe('/home');
  });

  it('should redirect to competition home for basic competition routes', () => {
    expect(getPostAuthRedirect('/comp/123')).toBe('/comp/123');
    expect(getPostAuthRedirect('/comp/123/schedule')).toBe('/comp/123');
    expect(getPostAuthRedirect('/comp/abc-comp/results')).toBe('/comp/abc-comp');
    expect(getPostAuthRedirect('/comp/winter-championship-2024/manage')).toBe('/comp/winter-championship-2024');
  });

  it('should preserve nested resource context for competition events', () => {
    expect(getPostAuthRedirect('/comp/123/events/456')).toBe('/comp/123/events/456');
    expect(getPostAuthRedirect('/comp/123/events/456/schedule')).toBe('/comp/123/events/456');
    expect(getPostAuthRedirect('/comp/abc/events/winter-ball/results')).toBe('/comp/abc/events/winter-ball');
  });

  it('should preserve nested resource context for other competition resources', () => {
    expect(getPostAuthRedirect('/comp/123/sessions/456')).toBe('/comp/123/sessions/456');
    expect(getPostAuthRedirect('/comp/123/rounds/semi-final')).toBe('/comp/123/rounds/semi-final');
    expect(getPostAuthRedirect('/comp/123/sessions/morning/details')).toBe('/comp/123/sessions/morning');
  });

  it('should handle organization routes with nested resources', () => {
    expect(getPostAuthRedirect('/org/123')).toBe('/org/123');
    expect(getPostAuthRedirect('/org/my-org/settings')).toBe('/org/my-org');
    expect(getPostAuthRedirect('/org/123/events/456')).toBe('/org/123/events/456');
    expect(getPostAuthRedirect('/org/dance-studio/members/john-doe')).toBe('/org/dance-studio/members/john-doe');
  });

  it('should handle other resource types', () => {
    expect(getPostAuthRedirect('/event/456')).toBe('/event/456');
    expect(getPostAuthRedirect('/studio/123')).toBe('/studio/123');
    expect(getPostAuthRedirect('/studio/123/classes/beginner-waltz')).toBe('/studio/123/classes/beginner-waltz');
    expect(getPostAuthRedirect('/venue/456')).toBe('/venue/456');
  });

  it('should return default path for unmatched routes', () => {
    expect(getPostAuthRedirect('/dashboard')).toBe('/home');
    expect(getPostAuthRedirect('/profile')).toBe('/home');
    expect(getPostAuthRedirect('/unknown/route')).toBe('/home');
    expect(getPostAuthRedirect('/comp')).toBe('/home'); // No competition ID
  });

  it('should handle edge cases', () => {
    expect(getPostAuthRedirect('/comp/')).toBe('/home'); // Trailing slash, no ID
    expect(getPostAuthRedirect('/comp//123')).toBe('/home'); // Double slash
    expect(getPostAuthRedirect('comp/123')).toBe('/home'); // No leading slash
  });
});