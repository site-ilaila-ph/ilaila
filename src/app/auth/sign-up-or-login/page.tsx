'use client';

import { Suspense } from 'react';
import { SignUpOrLoginPage } from '@/components/blocks/auth/sign-up-or-login-page';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">Naglo-load...</div>}>
      <SignUpOrLoginPage />
    </Suspense>
  );
}
