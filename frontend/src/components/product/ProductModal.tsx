import { useMemo, useState } from 'react';
import { Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BADGE_LABELS, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProductImage } from '@/components/ui/ProductImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Textarea } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import {
  AddonGroupSelector,
  isGroupValid,
  type AddonSelection,
} from '@/components/product/AddonGroupSelector';
import { formatCurrency } from '@/lib/format';
import { effectivePrice, hasDiscount } from '@/lib/pricing';
import { useCartStore } from '@/store/cart.store';
import type { AddonGroup, CartItemAddon, Product } from '@/types';

const MAX_NOTES_LENGTH = 200;

interface ProductModalProps {
  product?: Product;
  addonGroups: AddonGroup[];
  onClose: () => void;
}

export function ProductModal({ product, addonGroups, onClose }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState<AddonSelection>({});
  const [notes, setNotes] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const groups = useMemo(() => {
    if (!product) return [];
    return product.addonGroupIds
      .map((id) => addonGroups.find((group) => group.id === id))
      .filter((group): group is AddonGroup => group !== undefined);
  }, [product, addonGroups]);

  const selectedAddons = useMemo<CartItemAddon[]>(() => {
    return groups.flatMap((group) =>
      group.options
        .filter((option) => (selection[option.id] ?? 0) > 0)
        .map((option) => ({
          addonId: option.id,
          groupId: group.id,
          name: option.name,
          price: option.price,
          quantity: selection[option.id],
        })),
    );
  }, [groups, selection]);

  const unitPrice = product ? effectivePrice(product) : 0;
  const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price * addon.quantity, 0);
  const lineTotal = (unitPrice + addonsPrice) * quantity;

  const reset = () => {
    setQuantity(1);
    setSelection({});
    setNotes('');
    setShowErrors(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectionChange = (group: AddonGroup, addonId: string, nextQuantity: number) => {
    setSelection((current) => {
      const isSingleChoice = group.maxSelection === 1 && !group.allowRepeat;
      const next = { ...current };

      if (isSingleChoice) {
        for (const option of group.options) delete next[option.id];
      }

      if (nextQuantity <= 0) {
        delete next[addonId];
      } else {
        next[addonId] = nextQuantity;
      }

      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    const invalidGroup = groups.find((group) => !isGroupValid(group, selection));
    if (invalidGroup) {
      setShowErrors(true);
      toast(`Escolha uma opção em "${invalidGroup.name}".`, 'error');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice,
      originalPrice: hasDiscount(product) ? product.price : undefined,
      quantity,
      addons: selectedAddons,
      notes: notes.trim() || undefined,
    });

    toast(`${quantity}x ${product.name} adicionado ao carrinho!`);
    handleClose();
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={handleClose}
      title={product?.name ?? ''}
      variant="sheet"
      footer={
        <div className="flex items-center gap-3 pb-1">
          <QuantityStepper value={quantity} onChange={setQuantity} max={30} label="do produto" />
          <Button size="lg" full onClick={handleAddToCart} className="flex-1">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            Adicionar · {formatCurrency(lineTotal)}
          </Button>
        </div>
      }
    >
      {product && (
        <>
          <div className="relative h-52 w-full sm:h-60">
            <ProductImage src={product.imageUrl} alt={product.name} eager className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised to-transparent" />
          </div>

          <div className="space-y-3 px-5 py-4">
            {product.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.badges.map((badge) => (
                  <Badge key={badge} variant={badge}>
                    {BADGE_LABELS[badge]}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-sm leading-relaxed text-brand-white/70">{product.description}</p>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-brand-gold">
                {formatCurrency(unitPrice)}
              </span>
              {hasDiscount(product) && (
                <span className="text-sm text-brand-white/35 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-brand-white/45">
              {product.preparationTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  Preparo em ~{product.preparationTimeMinutes} min
                </span>
              )}
              {product.serves && <span>{product.serves}</span>}
            </div>

            {product.ingredients.length > 0 && (
              <div className="pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-brand-white/50">
                  Ingredientes
                </h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {product.ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-brand-white/60"
                    >
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {groups.map((group) => (
            <AddonGroupSelector
              key={group.id}
              group={group}
              selection={selection}
              showError={showErrors}
              onChange={(addonId, nextQuantity) =>
                handleSelectionChange(group, addonId, nextQuantity)
              }
            />
          ))}

          <div className="border-t border-surface-border px-5 py-4">
            <Textarea
              label="Alguma observação?"
              placeholder="Ex.: sem cebola, ponto da carne, maionese separada..."
              maxLength={MAX_NOTES_LENGTH}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              hint={`${notes.length}/${MAX_NOTES_LENGTH} caracteres`}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
