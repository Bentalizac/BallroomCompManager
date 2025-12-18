"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/authForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
