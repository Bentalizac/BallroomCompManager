"use client";

import React from "react";
import { CompetitionLayout } from "@/components/competitions/CompetitionLayout";

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  
  return (
    <CompetitionLayout slug={slug}>
      {children}
    </CompetitionLayout>
  );
}
