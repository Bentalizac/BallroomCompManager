'use client';

import { Header } from '@/components/custom/header';
import { IdProvider, IdContext } from '@/providers/idProvider/compIdProvider';
import { useContext } from 'react';


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

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  return (
    <IdProvider id={params.id}>
      <LayoutWithContext>{children}</LayoutWithContext>
    </IdProvider>
  );
}