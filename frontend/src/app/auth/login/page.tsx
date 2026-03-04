import { Suspense } from 'react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { LoginPage } from '@/components/LoginPage';

export default function Login() {
  return (
    <StoreLayout>
      <Suspense>
        <LoginPage />
      </Suspense>
    </StoreLayout>
  );
}
