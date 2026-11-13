import React, { useMemo, useState } from 'react';
import { ArrowRight, Box, Menu, Search, ShoppingBag, X } from 'lucide-react';
import {
  IPHONE_PRODUCTS,
  PhoneCategory,
  PhoneColorOption,
  PhoneProduct,
  SHOWCASE_FINISHES,
  StorageOption,
} from './data/catalog';
import { FmkLogo } from './components/FmkLogo';
import { ThreeViewport } from './components/ThreeViewport';
import { Explore3DExperienceSection } from './components/Explore3DExperienceSection';
import { PartsExplorerSection } from './components/PartsExplorerSection';
import { TechnologySection } from './components/TechnologySection';
import { CartSelection, ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { AboutAndContactSection } from './components/AboutAndContactSection';

type PriceRange = 'all' | 'under-800' | '800-1099' | '1100-plus';

export default function App() {
  // Hero finish switcher
  const [heroFinish, setHeroFinish] = useState<PhoneColorOption>(SHOWCASE_FINISHES[0]);

  // Mobile nav drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhoneCategory>('All');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');

  // Product Detail Modal state
  const [detailModal, setDetailModal] = useState<{
    product: PhoneProduct;
    storage?: StorageOption;
    color?: PhoneColorOption;
  } | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalBagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const addSelectionToCart = (selection: CartSelection, openDrawer = false) => {
    const key = `${selection.product.id}__${selection.storage.label}__${selection.color.name}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          product: selection.product,
          storage: selection.storage,
          color: selection.color,
          unitPrice: selection.finalPrice,
          quantity: 1,
        },
      ];
    });

    if (openDrawer) {
      setCartOpen(true);
    } else {
      showToast(`Added ${selection.product.model} (${selection.storage.label}) to your bag`);
    }
  };

  const updateCartQuantity = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const filteredProducts = useMemo(() => {
    return IPHONE_PRODUCTS.filter((phone) => {
      const matchesCategory =
        selectedCategory === 'All' || phone.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        phone.model.toLowerCase().includes(q) ||
        phone.tagline.toLowerCase().includes(q) ||
        phone.chip.toLowerCase().includes(q) ||
        phone.seriesLabel.toLowerCase().includes(q);

      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'under-800' && phone.basePrice < 800) ||
        (priceRange === '800-1099' &&
          phone.basePrice >= 800 &&
          phone.basePrice <= 1099) ||
        (priceRange === '1100-plus' && phone.basePrice >= 1100);

      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  const categories: PhoneCategory[] = ['All', 'Latest Gen', 'Pro Series', 'Standard'];

  return (
    <div id="top" className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3.5 lg:px-8">
          {/* Zone 1: Brand Wordmark */}
          <a href="#top" className="whitespace-nowrap shrink-0">
            <FmkLogo />
          </a>

          {/* Zone 2: 5 Single-Line Nav Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#A1A1AA] md:flex">
            <a
              href="#experience-3d"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#D4AF37]"
            >
              3D Experience
            </a>
            <a
              href="#iphones"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#D4AF37]"
            >
              iPhones
            </a>
            <a
              href="#mobile-parts"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#D4AF37]"
            >
              Parts Lab
            </a>
            <a
              href="#technology"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#D4AF37]"
            >
              Technology
            </a>
            <a
              href="#about-contact"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#D4AF37]"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#09090B] whitespace-nowrap shrink-0 transition-colors hover:bg-[#E5C158]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Bag</span>
              <span className="font-mono-tabular">({totalBagCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#141418] text-[#FAFAFA] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-white/10 bg-[#0D0D10] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-[#D4D4D8]">
              <a
                href="#experience-3d"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#D4AF37]"
              >
                3D Experience
              </a>
              <a
                href="#iphones"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#D4AF37]"
              >
                iPhones
              </a>
              <a
                href="#mobile-parts"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#D4AF37]"
              >
                Parts Lab
              </a>
              <a
                href="#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#D4AF37]"
              >
                Technology
              </a>
              <a
                href="#about-contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#D4AF37]"
              >
                Contact
              </a>
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* Hero Section with 3D Rotating iPhone & Video Showcase */}
        <section className="relative overflow-hidden bg-[#09090B] pt-12 pb-20 lg:pt-16 lg:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
              {/* Hero Copy Column */}
              <div className="flex flex-col justify-center lg:col-span-6">
                <p className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                  FMK Flagship Collection · Curated by Faria
                </p>

                <h1 className="font-display mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl lg:text-6xl">
                  Welcome to FMK Mobile Store
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed font-medium text-[#D4D4D8] sm:text-xl">
                  Experience the Future of Mobile Technology
                </p>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#A1A1AA]">
                  Discover titanium-crafted iPhone flagships from iPhone 13 to iPhone 17, inspect every curve in real-time 3D video demonstrations, and explore all 11 internal smartphone components before you buy.
                </p>

                {/* Primary Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#iphones"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-[#09090B] whitespace-nowrap transition-colors hover:bg-[#E5C158]"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#experience-3d"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#141418] px-6 py-3.5 text-sm font-semibold text-[#FAFAFA] whitespace-nowrap transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <Box className="h-4 w-4 text-[#D4AF37]" />
                    <span>Explore 3D Mobiles</span>
                  </a>
                </div>

                {/* Quick Finish Switcher for Hero 3D iPhone */}
                <div className="mt-10 border-t border-white/10 pt-6">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#A1A1AA]">
                      Hero 3D Finish Preview
                    </span>
                    <span className="font-semibold text-[#D4AF37]">{heroFinish.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {SHOWCASE_FINISHES.map((finish) => {
                      const active = finish.name === heroFinish.name;
                      return (
                        <button
                          key={finish.name}
                          type="button"
                          onClick={() => setHeroFinish(finish)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'border-[#D4AF37] bg-[#D4AF37]/12 text-[#FAFAFA]'
                              : 'border-white/10 bg-[#141418] text-[#A1A1AA] hover:text-[#FAFAFA]'
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/25"
                            style={{ backgroundColor: finish.hex }}
                          />
                          <span>{finish.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hero 3D Rotating iPhone Cinema Stage */}
              <div className="lg:col-span-6">
                <ThreeViewport
                  mode="hero"
                  finish={heroFinish}
                  cameraCount={3}
                  modelLabel="iPhone 17 Pro · FMK Edition"
                  showVideoControls={true}
                  autoPlay={true}
                  videoTitle={`iPhone 17 Pro · ${heroFinish.name} 3D Hero Reel`}
                  className="h-[430px] w-full rounded-2xl border border-white/10 sm:h-[520px] lg:h-full lg:min-h-[540px]"
                />
              </div>
            </div>

            {/* Full-Width Key Proof Strip Below Split */}
            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#D4AF37]">
                  iPhone 13 – 17
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Complete flagship lineup with verified storage & finish configurations
                </p>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#FAFAFA]">
                  11 3D Modules
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Exploded-view interactive engineering for every internal smartphone part
                </p>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#FAFAFA]">
                  360° Studio Video
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Real-time interactive WebGL playback with Play, Pause & Full Screen
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Explore 3D Mobile Experience */}
        <Explore3DExperienceSection />

        {/* Section 5 & 9: iPhone Products Catalog (Alabaster White Luxury Contrast Section) */}
        <section
          id="iphones"
          className="border-t border-[#E4E4E7] bg-[#FAFAFA] py-20 text-[#09090B] lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold tracking-widest text-[#9A7B2C] uppercase">
                  Flagship Smartphone Collection
                </p>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[#09090B] sm:text-5xl">
                  iPhone Lineup · 13 to 17
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#52525B]">
                  Choose your model, storage capacity, and metallic finish. Toggle live 3D previews directly on any card or inspect full specifications before purchasing.
                </p>
              </div>

              <div className="font-mono-tabular text-xs font-medium text-[#52525B]">
                Showing {filteredProducts.length} of {IPHONE_PRODUCTS.length} Flagship Models
              </div>
            </div>

            {/* Search, Category Tabs & Price Filter Toolbar */}
            <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Mobile Phones */}
              <div className="relative flex-1 lg:max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mobile phones (e.g. iPhone 17, A19)..."
                  aria-label="Search mobile phones"
                  className="w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] py-2.5 pr-4 pl-10 text-sm text-[#09090B] placeholder-[#71717A] focus:border-[#09090B] focus:outline-none"
                />
              </div>

              {/* Product Categories */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F4F4F5] p-1">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-[#09090B] text-[#D4AF37]'
                          : 'text-[#52525B] hover:text-[#09090B]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-2.5">
                <label
                  htmlFor="fmk-price-filter"
                  className="text-xs font-semibold text-[#52525B] whitespace-nowrap"
                >
                  Price Range
                </label>
                <select
                  id="fmk-price-filter"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as PriceRange)}
                  className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-2 text-xs font-semibold text-[#09090B] focus:border-[#09090B] focus:outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="under-800">Under $800</option>
                  <option value="800-1099">$800 – $1,099</option>
                  <option value="1100-plus">$1,100 & Above</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(sel) => addSelectionToCart(sel, false)}
                    onBuyNow={(sel) => addSelectionToCart(sel, true)}
                    onOpenDetails={(prod, storage, color) =>
                      setDetailModal({ product: prod, storage, color })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E4E4E7] bg-white px-6 py-16 text-center">
                <p className="font-display text-2xl font-semibold text-[#09090B]">
                  No matching smartphones found
                </p>
                <p className="mt-2 text-sm text-[#52525B]">
                  Try clearing your search query or switching price and category filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceRange('all');
                  }}
                  className="mt-6 rounded-xl bg-[#09090B] px-5 py-2.5 text-xs font-semibold text-[#D4AF37]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Explore Mobile Parts in 3D */}
        <PartsExplorerSection />

        {/* Section 6: Inside the Technology */}
        <TechnologySection />

        {/* Section 7 & 8: About Us & Contact Information */}
        <AboutAndContactSection />
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailModal?.product || null}
        initialStorage={detailModal?.storage}
        initialColor={detailModal?.color}
        onClose={() => setDetailModal(null)}
        onAddToCart={(sel) => addSelectionToCart(sel, false)}
        onBuyNow={(sel) => addSelectionToCart(sel, true)}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={() => setCartItems([])}
      />

      {/* Non-intrusive Add-to-Bag Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-[#D4AF37]/50 bg-[#09090B] px-4 py-3 text-xs font-medium text-[#FAFAFA] shadow-2xl">
          <span className="text-[#D4AF37]">Bag Updated</span>
          <span aria-hidden="true" className="text-[#52525B]">·</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="ml-2 font-semibold text-[#D4AF37] underline"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}
