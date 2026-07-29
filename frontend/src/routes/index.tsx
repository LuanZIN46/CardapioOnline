import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderSentPage = lazy(() => import('@/pages/OrderSentPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="container space-y-3 py-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'checkout', element: withSuspense(<CheckoutPage />) },
      { path: 'pedido-enviado', element: withSuspense(<OrderSentPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
