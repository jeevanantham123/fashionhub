import { Suspense } from 'react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { SearchPage } from '@/components/SearchPage';

export default function Search() {
  return (
    <StoreLayout>
      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" /></div>}>
        <SearchPage />
      </Suspense>
    </StoreLayout>
  );
}
