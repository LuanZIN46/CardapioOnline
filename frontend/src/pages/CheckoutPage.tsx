import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  CreditCard,
  FileText,
  QrCode,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { OptionCard } from '@/components/ui/OptionCard';
import { toast } from '@/components/ui/Toaster';
import { CouponField } from '@/components/checkout/CouponField';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { useCartTotals } from '@/hooks/use-cart';
import { useStoreSettings } from '@/hooks/use-catalog';
import { useStoreStatus } from '@/hooks/use-store-status';
import { formatCurrency, maskCurrency, maskPhone, parseCurrencyToCents } from '@/lib/format';
import { itemTotal } from '@/lib/pricing';
import {
  createCheckoutSchema,
  STEP_ONE_FIELDS,
  type CheckoutFormValues,
} from '@/lib/validation/checkout.schema';
import { generateOrderPDF, type OrderDocument } from '@/services/pdf/orderPdf.service';
import { generateOrderCode } from '@/services/whatsapp.service';
import { getCartTotals } from '@/store/cart.selectors';
import { useCartStore } from '@/store/cart.store';
import { useLastOrderStore } from '@/store/last-order.store';

type Etapa = 1 | 2;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const status = useStoreStatus(settings.openingHours);
  const clearCart = useCartStore((state) => state.clear);
  const couponCode = useCartStore((state) => state.couponCode);
  const definirUltimoPedido = useLastOrderStore((state) => state.definir);
  const [etapa, setEtapa] = useState<Etapa>(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      orderType: 'delivery',
      address: { street: '', number: '', neighborhood: '', city: '' },
      payment: 'pix',
      needsChange: false,
      changeFor: '',
      notes: '',
    },
    mode: 'onBlur',
    resolver: (values, context, options) => {
      const fee = values.orderType === 'delivery' ? settings.deliveryFee : 0;
      const { total } = getCartTotals(fee);
      return zodResolver(createCheckoutSchema(total))(values, context, options);
    },
  });

  const orderType = watch('orderType');
  const payment = watch('payment');
  const needsChange = watch('needsChange');
  const changeFor = watch('changeFor');

  const deliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0;
  const { items, totals } = useCartTotals({ deliveryFee });

  // Após enviar o pedido o carrinho fica vazio de propósito, então a guarda abaixo é desligada.
  const orderSent = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !orderSent.current) navigate('/', { replace: true });
  }, [items.length, navigate]);

  useEffect(() => {
    if (payment !== 'cash') setValue('needsChange', false);
  }, [payment, setValue]);

  const avancar = async () => {
    const valido = await trigger([...STEP_ONE_FIELDS]);
    if (!valido) return;

    setEtapa(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const voltar = () => {
    if (etapa === 2) {
      setEtapa(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(-1);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    const order: OrderDocument = {
      orderCode: generateOrderCode(),
      createdAt: new Date(),
      customer: { name: values.name.trim(), phone: values.phone },
      type: values.orderType,
      address:
        values.orderType === 'delivery'
          ? {
              street: values.address.street ?? '',
              number: values.address.number ?? '',
              neighborhood: values.address.neighborhood ?? '',
              city: values.address.city ?? '',
            }
          : undefined,
      payment: {
        method: values.payment,
        changeFor:
          values.payment === 'cash' && values.needsChange
            ? parseCurrencyToCents(values.changeFor ?? '')
            : undefined,
      },
      items,
      totals,
      couponCode,
      notes: values.notes?.trim() || undefined,
      settings,
    };

    try {
      const pdf = await generateOrderPDF(order);
      definirUltimoPedido(order, pdf);
    } catch (erro) {
      console.error('[pdf] falha ao gerar o comprovante', erro);
      toast('Não conseguimos gerar o PDF. Tente novamente.', 'error');
      return;
    }

    orderSent.current = true;
    clearCart();
    navigate('/pedido-enviado', { replace: true });
  };

  /**
   * Erros da etapa 1 encontrados na validação final trazem o cliente de volta,
   * senão a mensagem ficaria escondida num passo que não está visível.
   */
  const onInvalid = () => {
    if (errors.name || errors.phone) {
      setEtapa(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  const rotuloEtapa2 = orderType === 'delivery' ? 'Entrega' : 'Retirada';

  return (
    <main className="container max-w-2xl py-6 pb-16">
      <button
        type="button"
        onClick={voltar}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-brand-white/60 transition-colors hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {etapa === 2 ? 'Voltar aos seus dados' : 'Voltar ao cardápio'}
      </button>

      <h1 className="font-display text-2xl font-extrabold">Finalizar pedido</h1>

      <div className="mt-5">
        <StepIndicator atual={etapa} etapas={['Seus dados', rotuloEtapa2]} />
      </div>

      {!status.isOpen && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
        >
          Estamos fechados no momento. {status.message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-6 space-y-6" noValidate>
        {/* ------------------------------------------------ Etapa 1 */}
        <div hidden={etapa !== 1} className="space-y-6">
          <Section title="Seus dados">
            <Input
              label="Nome completo"
              required
              placeholder="Como podemos te chamar?"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  label="Celular"
                  required
                  inputMode="numeric"
                  placeholder="(14) 99999-9999"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  value={field.value}
                  onChange={(event) => field.onChange(maskPhone(event.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Section>

          <Button type="button" size="lg" full onClick={avancar}>
            Próximo
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        {/* ------------------------------------------------ Etapa 2 */}
        <div hidden={etapa !== 2} className="space-y-6">
          <Section title="Como deseja receber o pedido?">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Tipo do pedido">
              <OptionCard
                selected={orderType === 'delivery'}
                onSelect={() => setValue('orderType', 'delivery')}
                icon={<Bike className="h-5 w-5" />}
                title="Entrega"
                description={`${formatCurrency(settings.deliveryFee)} · ${settings.deliveryTimeMinutes.min}-${settings.deliveryTimeMinutes.max} min`}
              />
              <OptionCard
                selected={orderType === 'pickup'}
                onSelect={() => setValue('orderType', 'pickup')}
                icon={<Store className="h-5 w-5" />}
                title="Retirada no balcão"
                description={`Sem taxa · ${settings.pickupTimeMinutes.min}-${settings.pickupTimeMinutes.max} min`}
              />
            </div>
          </Section>

          {orderType === 'delivery' ? (
            <Section title="Endereço de entrega">
              <Input
                label="Rua"
                required
                placeholder="Rua Rio Branco"
                autoComplete="address-line1"
                error={errors.address?.street?.message}
                {...register('address.street')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Número"
                  required
                  placeholder="450"
                  error={errors.address?.number?.message}
                  {...register('address.number')}
                />
                <Input
                  label="Bairro"
                  required
                  placeholder="Centro"
                  error={errors.address?.neighborhood?.message}
                  {...register('address.neighborhood')}
                />
              </div>

              <Input
                label="Cidade"
                required
                placeholder="Bauru"
                error={errors.address?.city?.message}
                {...register('address.city')}
              />
            </Section>
          ) : (
            <Section title="Local de retirada">
              <p className="rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-sm text-brand-white/70">
                {settings.address}
              </p>
            </Section>
          )}

          <Section title="Forma de pagamento">
            <div className="grid gap-2" role="radiogroup" aria-label="Forma de pagamento">
              <OptionCard
                selected={payment === 'pix'}
                onSelect={() => setValue('payment', 'pix')}
                icon={<QrCode className="h-5 w-5" />}
                title="PIX"
                description={`Chave: ${settings.pixKey}`}
              />
              <OptionCard
                selected={payment === 'card'}
                onSelect={() => setValue('payment', 'card')}
                icon={<CreditCard className="h-5 w-5" />}
                title="Cartão"
                description="Crédito ou débito na entrega"
              />
              <OptionCard
                selected={payment === 'cash'}
                onSelect={() => setValue('payment', 'cash')}
                icon={<Banknote className="h-5 w-5" />}
                title="Dinheiro"
                description="Combine o troco com a gente"
              />
            </div>

            {payment === 'cash' && (
              <div className="space-y-3 rounded-xl border border-surface-border bg-surface-muted p-4">
                <p className="text-sm font-semibold">Precisa de troco?</p>
                <div className="flex gap-2">
                  <Button
                    variant={needsChange ? 'primary' : 'secondary'}
                    onClick={() => setValue('needsChange', true)}
                    full
                  >
                    Sim
                  </Button>
                  <Button
                    variant={!needsChange ? 'primary' : 'secondary'}
                    onClick={() => setValue('needsChange', false)}
                    full
                  >
                    Não
                  </Button>
                </div>

                {needsChange && (
                  <Controller
                    control={control}
                    name="changeFor"
                    render={({ field }) => (
                      <Input
                        label="Troco para quanto?"
                        required
                        inputMode="numeric"
                        placeholder="0,00"
                        error={errors.changeFor?.message}
                        hint={
                          parseCurrencyToCents(changeFor ?? '') > totals.total
                            ? `Troco de ${formatCurrency(parseCurrencyToCents(changeFor ?? '') - totals.total)}`
                            : `Total do pedido: ${formatCurrency(totals.total)}`
                        }
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(maskCurrency(event.target.value))}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                )}
              </div>
            )}
          </Section>

          <Section title="Cupom de desconto">
            <CouponField
              subtotal={totals.subtotal}
              discount={totals.discount}
              appliedCode={couponCode}
            />
          </Section>

          <Section title="Observações do pedido">
            <Textarea
              placeholder="Ex.: sem cebola, campainha quebrada, entregar na portaria..."
              maxLength={300}
              error={errors.notes?.message}
              {...register('notes')}
            />
          </Section>

          <section className="card-surface space-y-3 p-5">
            <h2 className="font-display text-base font-bold">Resumo</h2>
            <ul className="space-y-1.5 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-brand-white/70">
                  <span className="min-w-0 truncate">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="shrink-0 font-semibold">{formatCurrency(itemTotal(item))}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 border-t border-surface-border pt-3 text-sm">
              <div className="flex justify-between text-brand-white/60">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto</span>
                  <span>- {formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-white/60">
                <span>{orderType === 'delivery' ? 'Taxa de entrega' : 'Retirada no balcão'}</span>
                <span>
                  {totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-surface-border pt-2 font-display text-lg font-extrabold">
                <span>Total</span>
                <span className="text-brand-gold">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </section>

          <div className="space-y-2">
            <Button type="submit" size="lg" full loading={isSubmitting}>
              <FileText className="h-5 w-5" aria-hidden />
              {isSubmitting ? 'Gerando comprovante...' : 'Gerar pedido em PDF'}
            </Button>
            <p className="text-center text-xs text-brand-white/40">
              Na próxima tela você envia o PDF para o WhatsApp do {settings.name}.
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-base font-bold text-brand-gold">{title}</h2>
      {children}
    </section>
  );
}
