import { Outlet } from 'react-router-dom';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { FloatingCartBar } from '@/components/layout/FloatingCartBar';
import { Header } from '@/components/layout/Header';
import { ProductModal } from '@/components/product/ProductModal';
import { useAddonGroups, useStoreSettings } from '@/hooks/use-catalog';
import { useStoreStatus } from '@/hooks/use-store-status';
import { useUiStore } from '@/store/ui.store';

export function AppLayout() {
  const { settings } = useStoreSettings();
  const status = useStoreStatus(settings.openingHours);
  const { data: addonGroups = [] } = useAddonGroups();
  const selectedProduct = useUiStore((state) => state.selectedProduct);
  const closeProduct = useUiStore((state) => state.closeProduct);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-gold focus:px-4 focus:py-2 focus:font-bold focus:text-brand-black"
      >
        Pular para o conteúdo
      </a>

      <Header settings={settings} status={status} />

      <div id="conteudo" className="flex-1">
        <Outlet />
      </div>

      <Footer settings={settings} />

      <FloatingCartBar deliveryFee={settings.deliveryFee} />
      <CartDrawer settings={settings} />
      <ProductModal product={selectedProduct} addonGroups={addonGroups} onClose={closeProduct} />
    </div>
  );
}
