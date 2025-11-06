"use client";

import CompSchedulePage from "@/app/(app)/comp/[slug]/schedule/page";

// Render the existing competition schedule component inside the dev route.
// Use a proper React component default export so Next can render it.
export default function Page() {
  return <CompSchedulePage />;
}
    