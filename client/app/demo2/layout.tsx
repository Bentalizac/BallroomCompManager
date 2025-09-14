import { Header } from '@/components/custom/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer>
        <p>Footer Here</p>
      </footer>
    </>
  );
}
