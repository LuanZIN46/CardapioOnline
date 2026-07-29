import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import type { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  activeId: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeId]);

  return (
    <nav
      aria-label="Categorias do cardápio"
      className="sticky top-16 z-30 border-b border-surface-border bg-brand-black/95 backdrop-blur-md"
    >
      <div ref={listRef} className="no-scrollbar container flex gap-2 overflow-x-auto py-3">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              data-active={isActive}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelect(category.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                isActive
                  ? 'border-brand-gold bg-brand-gold text-brand-black shadow-gold'
                  : 'border-surface-border bg-surface-raised text-brand-white/70 hover:border-brand-gold/50 hover:text-brand-white',
              )}
            >
              <span aria-hidden>{category.icon}</span>
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
