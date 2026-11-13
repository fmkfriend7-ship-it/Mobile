import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { PhoneColorOption, PhoneProduct, StorageOption } from '../data/catalog';
import { CameraViewPreset, ThreeViewport } from './ThreeViewport';
import { CartSelection } from './ProductCard';

interface ProductDetailModalProps {
  product: PhoneProduct | null;
  initialStorage?: StorageOption;
  initialColor?: PhoneColorOption;
  onClose: () => void;
  onAddToCart: (selection: CartSelection) => void;
  onBuyNow: (selection: CartSelection) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialStorage,
  initialColor,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [storage, setStorage] = useState<StorageOption | null>(null);
  const [color, setColor] = useState<PhoneColorOption | null>(null);
  const [preset, setPreset] = useState<CameraViewPreset>('360');

  useEffect(() => {
    if (product) {
      setStorage(initialStorage || product.storageOptions[0]);
      setColor(initialColor || product.colors[0]);
      setPreset('360');
    }
  }, [product, initialStorage, initialColor]);

  if (!product || !storage || !color) return null;

  const finalPrice = product.basePrice + storage.priceDelta;
  const selection: CartSelection = { product, storage, color, finalPrice };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.model} Details`}
    >
      <div className="relative grid max-h-[92vh] w-full max-w-5xl grid-cols-1 overflow-y-auto rounded-2xl border border-white/15 bg-[#09090B] text-[#FAFAFA] lg:grid-cols-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#141418] text-[#FAFAFA] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Column: Live Interactive 3D Viewport */}
        <div className="flex flex-col border-b border-white/10 bg-[#0D0D10] lg:col-span-7 lg:border-r lg:border-b-0">
          <ThreeViewport
            mode="cinema"
            finish={color}
            cameraCount={product.cameraCount}
            modelLabel={product.model}
            cameraPreset={preset}
            showVideoControls={true}
            autoPlay={true}
            videoTitle={`${product.model} · ${color.name}`}
            className="h-[340px] w-full sm:h-[440px] lg:h-full"
          />
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 bg-[#111115] px-4 py-3">
            {(
              [
                ['360', '360°'],
                ['front', 'Front'],
                ['back', 'Back'],
                ['side', 'Side'],
                ['camera-zoom', 'Camera'],
              ] as [CameraViewPreset, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  preset === id
                    ? 'bg-[#D4AF37] text-[#09090B]'
                    : 'border border-white/10 bg-[#18181D] text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
                <span>{product.seriesLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{product.releaseYear}</span>
              </div>
              <h2 className="font-display mt-1 text-3xl font-semibold text-[#FAFAFA] sm:text-4xl">
                {product.model}
              </h2>
              <div className="font-mono-tabular mt-2 text-2xl font-semibold text-[#D4AF37]">
                ${finalPrice.toLocaleString()}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                {product.description}
              </p>
            </div>

            {/* Hardware Spec Table */}
            <div className="space-y-2.5 border-y border-white/10 py-4 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[#71717A]">Processor</span>
                <span className="text-right font-medium text-[#FAFAFA]">{product.chip}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#71717A]">Display</span>
                <span className="text-right font-medium text-[#FAFAFA]">{product.displaySpec}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#71717A]">Camera System</span>
                <span className="text-right font-medium text-[#FAFAFA]">{product.cameraSpec}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#71717A]">Battery</span>
                <span className="text-right font-medium text-[#FAFAFA]">{product.batterySpec}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#71717A]">Materials</span>
                <span className="text-right font-medium text-[#FAFAFA]">{product.materialSpec}</span>
              </div>
            </div>

            {/* Storage Selection */}
            <div>
              <div className="mb-2 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
                Select Storage
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.storageOptions.map((opt) => {
                  const active = opt.label === storage.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setStorage(opt)}
                      className={`font-mono-tabular rounded-xl border py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                          : 'border-white/10 bg-[#141418] text-[#D4D4D8] hover:border-white/25'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold tracking-wider text-[#A1A1AA] uppercase">
                  Finish
                </span>
                <span className="font-medium text-[#D4AF37]">{color.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => {
                  const active = c.name === color.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Finish ${c.name}`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform ${
                        active ? 'scale-110 border-[#D4AF37]' : 'border-white/25'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {active && <Check className="h-3.5 w-3.5 text-[#09090B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onBuyNow(selection);
                onClose();
              }}
              className="flex-1 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#09090B] whitespace-nowrap transition-colors hover:bg-[#E5C158]"
            >
              Buy Now · ${finalPrice.toLocaleString()}
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToCart(selection);
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#141418] px-5 py-3 text-sm font-semibold text-[#FAFAFA] whitespace-nowrap transition-colors hover:border-[#D4AF37]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
