import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BADGE_LABELS, Badge } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatCurrency } from '@/lib/format';
import { discountPercent, effectivePrice, hasDiscount } from '@/lib/pricing';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const unavailable = !product.available;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card-surface group relative overflow-hidden transition-colors ${
        unavailable ? 'opacity-60' : 'hover:border-brand-gold/40'
      }`}
    >
      <button
        type="button"
        onClick={() => !unavailable && onSelect(product)}
        disabled={unavailable}
        aria-label={`Ver detalhes de ${product.name}`}
        className="flex w-full gap-4 p-4 text-left disabled:cursor-not-allowed"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          {product.badges.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {product.badges.map((badge) => (
                <Badge key={badge} variant={badge}>
                  {BADGE_LABELS[badge]}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-display text-base font-bold leading-snug">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-brand-white/55">{product.description}</p>

          {product.serves && (
            <p className="mt-1.5 text-xs text-brand-white/40">{product.serves}</p>
          )}

          <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-3">
            <span className="font-display text-lg font-extrabold text-brand-gold">
              {formatCurrency(effectivePrice(product))}
            </span>
            {hasDiscount(product) && (
              <>
                <span className="text-sm text-brand-white/35 line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="promocao">-{discountPercent(product)}%</Badge>
              </>
            )}
          </div>
        </div>

        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center text-[11px] font-bold uppercase text-brand-white/80">
              Indisponível
            </div>
          )}
        </div>
      </button>

      {!unavailable && (
        <button
          type="button"
          onClick={() => onSelect(product)}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-brand-black shadow-gold transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" aria-hidden />
        </button>
      )}
    </motion.article>
  );
}
