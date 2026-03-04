import { Suspense } from 'react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductsPage } from '@/components/ProductsPage';

export default function Products() {
  return (
    <StoreLayout>
      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" /></div>}>
        <ProductsPage />
      </Suspense>
    </StoreLayout>
  );
}
