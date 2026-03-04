import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductDetailPage } from '@/components/ProductDetailPage';

export default function ProductDetail({ params }: { params: { slug: string } }) {
  return (
    <StoreLayout>
      <ProductDetailPage slug={params.slug} />
    </StoreLayout>
  );
}
