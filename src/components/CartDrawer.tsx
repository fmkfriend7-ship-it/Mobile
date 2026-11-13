import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { PhoneColorOption, PhoneProduct, StorageOption } from '../data/catalog';

export interface CartItem {
  key: string;
  product: PhoneProduct;
  storage: StorageOption;
  color: PhoneColorOption;
  unitPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('card');
  const [orderNumber, setOrderNumber] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal > 0 ? 0 : 0; // Complimentary insured express shipping
  const total = subtotal + shipping;

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) return;
    const generatedId = `FMK-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedId);
    setConfirmedTotal(total);
    onClearCart();
    setStep('confirmed');
  };

  const resetAndClose = () => {
    if (step === 'confirmed') setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#09090B] text-[#FAFAFA]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-display text-2xl font-semibold text-[#FAFAFA]">
              {step === 'bag' && 'Your Shopping Bag'}
              {step === 'checkout' && 'Express Checkout'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close shopping bag"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#141418] text-[#FAFAFA] hover:border-[#D4AF37]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'confirmed' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-[#FAFAFA]">
                Thank You, {customerName}
              </h3>
              <p className="font-mono-tabular mt-2 text-sm text-[#D4AF37]">
                Order #{orderNumber} · Confirmed
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#A1A1AA]">
                FMK Mobile Store is preparing your insured luxury shipment to{' '}
                <span className="text-[#FAFAFA]">{customerAddress}</span>.
              </p>
              <div className="mt-6 w-full rounded-xl border border-white/10 bg-[#111115] p-4 text-left text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#A1A1AA]">Merchant</span>
                  <span className="font-medium text-[#FAFAFA]">FMK (Owner: Faria)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#A1A1AA]">Payment</span>
                  <span className="font-medium text-[#FAFAFA]">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Priority Card'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="font-semibold text-[#FAFAFA]">Total Paid / Due</span>
                  <span className="font-mono-tabular font-semibold text-[#D4AF37]">
                    ${confirmedTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="mt-8 w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#09090B] hover:bg-[#E5C158]"
              >
                Continue Exploring FMK
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-[#52525B]" />
              <p className="text-base font-medium text-[#FAFAFA]">Your bag is empty</p>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Select an iPhone model from our collection to begin.
              </p>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-xl border border-white/10 bg-[#111115] p-3.5"
                >
                  <img
                    src={item.color.image}
                    alt={item.product.model}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#FAFAFA]">
                          {item.product.model}
                        </h3>
                        <p className="text-xs text-[#A1A1AA]">
                          {item.storage.label} · {item.color.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.key)}
                        aria-label={`Remove ${item.product.model}`}
                        className="text-[#71717A] transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#18181D] px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, -1)}
                          aria-label="Decrease quantity"
                          className="p-1 text-[#A1A1AA] hover:text-[#FAFAFA]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono-tabular min-w-[20px] text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, 1)}
                          aria-label="Increase quantity"
                          className="p-1 text-[#A1A1AA] hover:text-[#FAFAFA]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-mono-tabular text-sm font-semibold text-[#D4AF37]">
                        ${(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form id="fmk-checkout-form" onSubmit={handleConfirmOrder} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-white/15 bg-[#141418] px-3.5 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-white/15 bg-[#141418] px-3.5 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                  Delivery Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street, Suite, City, Postal Code"
                  className="w-full rounded-xl border border-white/15 bg-[#141418] px-3.5 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                        : 'border-white/10 bg-[#141418] text-[#A1A1AA]'
                    }`}
                  >
                    Luxury Card / Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                        : 'border-white/10 bg-[#141418] text-[#A1A1AA]'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Totals & Checkout CTA */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="border-t border-white/10 bg-[#111115] px-6 py-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Subtotal</span>
                <span className="font-mono-tabular">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Insured Express Delivery</span>
                <span className="text-[#D4AF37]">Complimentary</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2.5 text-base font-semibold text-[#FAFAFA]">
                <span>Total</span>
                <span className="font-mono-tabular text-[#D4AF37]">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="mt-4 w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158]"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="rounded-xl border border-white/15 bg-[#18181D] px-4 py-3 text-sm font-medium text-[#FAFAFA]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="fmk-checkout-form"
                  className="flex-1 rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158]"
                >
                  Confirm Order · ${total.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
