import "./globals.css";
import { AuthProvider } from "@/providers/auth/authProvider";
import { TRPCProvider } from "@/providers/trpc/trpcProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BallroomCompManager",
  description: "Manage ballroom and other competitions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
