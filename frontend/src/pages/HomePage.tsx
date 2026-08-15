import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CatalogError } from '@/components/home/CatalogError';
import { CategoryNav } from '@/components/home/CategoryNav';
import { HeroBanner } from '@/components/home/HeroBanner';
import { ProductCard } from '@/components/home/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useCardapio, useCategories, useProducts, useStoreSettings } from '@/hooks/use-catalog';
import { useStoreStatus } from '@/hooks/use-store-status';
import { useUiStore } from '@/store/ui.store';
import type { Category, Product } from '@/types';

const SECTION_OFFSET_PX = 160;

export default function HomePage() {
  const { settings } = useStoreSettings();
  const status = useStoreStatus(settings.openingHours);
  const cardapio = useCardapio();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const carregando = cardapio.isPending;
  const openProduct = useUiStore((state) => state.openProduct);

  const [activeCategoryId, setActiveCategoryId] = useState('');
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const isProgrammaticScroll = useRef(false);

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, Product[]>();
    for (const product of products) {
      const list = grouped.get(product.categoryId) ?? [];
      list.push(product);
      grouped.set(product.categoryId, list);
    }
    return grouped;
  }, [products]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => (productsByCategory.get(category.id)?.length ?? 0) > 0),
    [categories, productsByCategory],
  );

  useEffect(() => {
    if (!activeCategoryId && visibleCategories.length > 0) {
      setActiveCategoryId(visibleCategories[0].id);
    }
  }, [activeCategoryId, visibleCategories]);

  useEffect(() => {
    const onScroll = () => {
      if (isProgrammaticScroll.current) return;

      let current = '';
      for (const category of visibleCategories) {
        const element = sectionRefs.current.get(category.id);
        if (element && element.getBoundingClientRect().top <= SECTION_OFFSET_PX) {
          current = category.id;
        }
      }

      // Acima da primeira seção nenhuma casa com o offset: volta para a categoria inicial.
      const proxima = current || visibleCategories[0]?.id;
      if (proxima) setActiveCategoryId(proxima);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [visibleCategories]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const element = sectionRefs.current.get(categoryId);
    if (!element) return;

    setActiveCategoryId(categoryId);
    isProgrammaticScroll.current = true;
    const top = element.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET_PX + 24;
    window.scrollTo({ top, behavior: 'smooth' });
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  }, []);

  const registerSection = useCallback((categoryId: string, element: HTMLElement | null) => {
    if (element) sectionRefs.current.set(categoryId, element);
    else sectionRefs.current.delete(categoryId);
  }, []);

  return (
    <>
      <HeroBanner settings={settings} status={status} />

      {!status.isOpen && (
        <div className="container pt-4">
          <p
            role="status"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300"
          >
            Estamos fechados no momento. Você pode montar seu pedido e enviar quando abrirmos.
          </p>
        </div>
      )}

      {cardapio.isError ? (
        <CatalogError
          erro={cardapio.error}
          aoTentarNovamente={() => void cardapio.refetch()}
          carregando={cardapio.isFetching}
        />
      ) : (
        <>
      <div className="pt-4">
        {carregando ? (
          <div className="container flex gap-2 py-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-10 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <CategoryNav
            categories={visibleCategories}
            activeId={activeCategoryId}
            onSelect={scrollToCategory}
          />
        )}
      </div>

      <main className="container space-y-10 py-8 pb-32">
        {carregando
          ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : visibleCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                products={productsByCategory.get(category.id) ?? []}
                onRegister={registerSection}
                onSelectProduct={openProduct}
              />
            ))}
      </main>
        </>
      )}
    </>
  );
}

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onRegister: (categoryId: string, element: HTMLElement | null) => void;
  onSelectProduct: (product: Product) => void;
}

function CategorySection({ category, products, onRegister, onSelectProduct }: CategorySectionProps) {
  return (
    <section
      id={`categoria-${category.slug}`}
      ref={(element) => onRegister(category.id, element)}
      aria-labelledby={`titulo-${category.slug}`}
      className="scroll-mt-36"
    >
      <h2
        id={`titulo-${category.slug}`}
        className="mb-4 flex items-center gap-2 font-display text-xl font-extrabold"
      >
        <span aria-hidden>{category.icon}</span>
        {category.name}
        <span className="text-sm font-medium text-brand-white/35">({products.length})</span>
      </h2>

      <div className="grid gap-3 lg:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
        ))}
      </div>
    </section>
  );
}
