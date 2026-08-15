import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RotaProtegida } from '@/components/admin/AdminLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderSentPage = lazy(() => import('@/pages/OrderSentPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// O painel entra por lazy loading: quem só abre o cardápio não baixa esse código.
const AdminLoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const ProdutosPage = lazy(() => import('@/pages/admin/ProdutosPage'));
const CategoriasPage = lazy(() => import('@/pages/admin/CategoriasPage'));

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
  { path: '/admin/login', element: withSuspense(<AdminLoginPage />) },
  {
    path: '/admin',
    element: <RotaProtegida />,
    children: [
      { index: true, element: <Navigate to="/admin/produtos" replace /> },
      { path: 'produtos', element: withSuspense(<ProdutosPage />) },
      { path: 'categorias', element: withSuspense(<CategoriasPage />) },
    ],
  },
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
