"use client";

import React from "react";
import { IdProvider } from "@/providers/compIdProvider/compIdProvider";

function LayoutWithContext({ children }: { children: React.ReactNode }) {
  // The AppHeader now handles all navigation logic based on pathname and auth state
  // No need for duplicate header here
  return <>{children}</>;
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  
  return (
    <IdProvider id={id}>
      <LayoutWithContext>{children}</LayoutWithContext>
    </IdProvider>
  );
}
