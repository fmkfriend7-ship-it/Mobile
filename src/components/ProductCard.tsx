import React, { useState } from 'react';
import { Box, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import { PhoneColorOption, PhoneProduct, StorageOption } from '../data/catalog';
import { ThreeViewport } from './ThreeViewport';

export interface CartSelection {
  product: PhoneProduct;
  storage: StorageOption;
  color: PhoneColorOption;
  finalPrice: number;
}

interface ProductCardProps {
  product: PhoneProduct;
  onAddToCart: (selection: CartSelection) => void;
  onBuyNow: (selection: CartSelection) => void;
  onOpenDetails: (product: PhoneProduct, storage: StorageOption, color: PhoneColorOption) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
}) => {
  const [selectedStorage, setSelectedStorage] = useState<StorageOption>(
    product.storageOptions[0]
  );
  const [selectedColor, setSelectedColor] = useState<PhoneColorOption>(
    product.colors[0]
  );
  const [show3DPreview, setShow3DPreview] = useState<boolean>(false);

  const finalPrice = product.basePrice + selectedStorage.priceDelta;

  const selection: CartSelection = {
    product,
    storage: selectedStorage,
    color: selectedColor,
    finalPrice,
  };

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Media Area: Studio Photo OR Live 3D Rotating Preview */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#09090B]">
          {show3DPreview ? (
            <ThreeViewport
              mode="card-preview"
              finish={selectedColor}
              cameraCount={product.cameraCount}
              modelLabel={product.model}
              autoPlay={true}
              className="h-full w-full"
            />
          ) : (
            <img
              src={selectedColor.image || product.defaultImage}
              alt={`${product.model} in ${selectedColor.name}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* 3D / Photo Toggle Button */}
          <button
            type="button"
            onClick={() => setShow3DPreview((prev) => !prev)}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#09090B]/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#D4AF37] transition-colors hover:border-[#D4AF37]"
          >
            {show3DPreview ? (
              <>
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Photo</span>
              </>
            ) : (
              <>
                <Box className="h-3.5 w-3.5" />
                <span>3D Preview</span>
              </>
            )}
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <span>{product.seriesLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{product.releaseYear}</span>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-2xl font-semibold text-[#09090B]">
              {product.model}
            </h3>
            <span className="font-mono-tabular text-lg font-semibold text-[#09090B]">
              ${finalPrice.toLocaleString()}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#52525B]">
            {product.tagline}
          </p>

          {/* Storage Options */}
          <div className="mt-5">
            <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-[#71717A] uppercase">
              Storage Capacity
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.storageOptions.map((option) => {
                const active = option.label === selectedStorage.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedStorage(option)}
                    className={`font-mono-tabular rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'border-[#09090B] bg-[#09090B] text-[#D4AF37]'
                        : 'border-[#E4E4E7] bg-[#FAFAFA] text-[#3F3F46] hover:border-[#09090B]/40'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Colors */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold tracking-wider text-[#71717A] uppercase">
                Finish
              </span>
              <span className="font-medium text-[#18181B]">{selectedColor.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {product.colors.map((color) => {
                const active = color.name === selectedColor.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color.name}`}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      active
                        ? 'scale-110 border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                        : 'border-[#D4D4D8] hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-[#F4F4F5] bg-[#FAFAFA] px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBuyNow(selection)}
            className="flex-1 rounded-xl bg-[#09090B] px-4 py-2.5 text-xs font-semibold text-[#D4AF37] whitespace-nowrap transition-colors hover:bg-[#18181B]"
          >
            Buy Now
          </button>
          <button
            type="button"
            onClick={() => onAddToCart(selection)}
            aria-label={`Add ${product.model} to bag`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D4D4D8] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#09090B] whitespace-nowrap transition-colors hover:border-[#09090B]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDetails(product, selectedStorage, selectedColor)}
            className="rounded-xl border border-[#D4D4D8] bg-white px-3 py-2.5 text-xs font-medium text-[#52525B] whitespace-nowrap transition-colors hover:border-[#09090B] hover:text-[#09090B]"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
};
