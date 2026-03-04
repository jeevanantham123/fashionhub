import { StoreLayout } from '@/components/layout/StoreLayout';
import { OrderDetailPage } from '@/components/OrderDetailPage';

export default function OrderDetail({ params }: { params: { id: string } }) {
  return <StoreLayout><OrderDetailPage orderId={params.id} /></StoreLayout>;
}
