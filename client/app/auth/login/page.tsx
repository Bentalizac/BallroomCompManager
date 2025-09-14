'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/authForm';


export default function Page() {
  return <AuthForm />;
}