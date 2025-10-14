"use client";

import React from "react";
import { IdProvider } from "@/providers/compIdProvider/compIdProvider";
import { CompetitionLayout } from "@/components/competitions/CompetitionLayout";

function LayoutWithContext({ 
  slug, 
  children 
}: { 
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <CompetitionLayout slug={slug}>
      {children}
    </CompetitionLayout>
  );
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  
  return (
    <IdProvider id={slug}>
      <LayoutWithContext slug={slug}>
        {children}
      </LayoutWithContext>
    </IdProvider>
  );
}
