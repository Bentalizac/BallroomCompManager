"use client";

import { Suspense } from "react";

/**
 * Wrapper component to handle Suspense boundary for useSearchParams
 * This prevents prerendering errors in Next.js 15
 */
export function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
