import { notFound } from 'next/navigation';

// Gate the entire /dev route group to development only.
// In production builds this will render a 404 for any /dev/* route.
export default function DevLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    // Render a 404 in production so the dev routes are not exposed
    notFound();
  }

  return <>{children}</>;
}
