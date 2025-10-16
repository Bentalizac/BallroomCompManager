"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  getPostAuthRedirect,
  getRedirectFromParams,
  storeRedirectPath,
} from "@/lib/redirects";

/**
 * Custom hook for managing authentication redirects
 */
export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles redirect after successful authentication
   */
  const handlePostAuthRedirect = useCallback(() => {
    const originPath = getRedirectFromParams(searchParams);
    const redirectPath = getPostAuthRedirect(originPath);

    // Use replace to avoid back button issues
    router.replace(redirectPath);
  }, [router, searchParams]);

  /**
   * Stores current path and navigates to auth page
   * @param currentPath - The current path to store for redirect
   * @param authPath - The auth page path (default: '/auth')
   */
  const redirectToAuth = useCallback(
    (currentPath: string, authPath: string = "/auth") => {
      // Store the current path for post-auth redirect
      storeRedirectPath(currentPath);

      // Navigate to auth with redirect parameter as backup
      const authUrl = new URL(authPath, window.location.origin);
      authUrl.searchParams.set("redirect", encodeURIComponent(currentPath));

      router.push(authUrl.pathname + authUrl.search);
    },
    [router],
  );

  return {
    handlePostAuthRedirect,
    redirectToAuth,
  };
}
