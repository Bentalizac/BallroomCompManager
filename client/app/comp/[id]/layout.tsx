"use client";

import { Header } from "@/components/custom/header";
import {
  IdProvider,
  IdContext,
} from "@/providers/compIdProvider/compIdProvider";
import React, { useContext } from "react";

function LayoutWithContext({ children }: { children: React.ReactNode }) {
  const context = useContext(IdContext);
  const id = context?.id;
  return (
    <>
      <Header id={id} />
      <main>{children}</main>
    </>
  );
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
