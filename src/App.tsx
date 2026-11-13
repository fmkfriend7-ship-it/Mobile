import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Box, Menu, Search, ShoppingBag, X } from 'lucide-react';
import {
  IPHONE_PRODUCTS,
  MOBILE_PARTS,
  MobilePart,
  PhoneCategory,
  PhoneColorOption,
  PhoneProduct,
  SHOWCASE_FINISHES,
  StorageOption,
} from './data/catalog';
import {
  fetchMobilePartsFromSupabase,
  fetchProductsFromSupabase,
} from './lib/supabase';
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

  // Catalog Products & Mobile Parts (hydrated from Supabase if configured)
  const [products, setProducts] = useState<PhoneProduct[]>(IPHONE_PRODUCTS);
  const [mobileParts, setMobileParts] = useState<MobilePart[]>(MOBILE_PARTS);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  // Cart State (persisted locally in browser storage; checkout saves to Supabase orders & order_items)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fmk_shopping_bag_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fmk_shopping_bag_v1', JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    let active = true;
    const loadFromSupabase = async () => {
      setLoadingCatalog(true);
      const [{ data: remoteProducts }, { data: remoteParts }] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchMobilePartsFromSupabase(),
      ]);
      if (active && remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts);
      }
      if (active && remoteParts && remoteParts.length > 0) {
        setMobileParts(remoteParts);
      }
      if (active) setLoadingCatalog(false);
    };
    void loadFromSupabase();
    return () => {
      active = false;
    };
  }, []);

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
      const nextItem: CartItem = existing
        ? { ...existing, quantity: existing.quantity + 1 }
        : {
            key,
            product: selection.product,
            storage: selection.storage,
            color: selection.color,
            unitPrice: selection.finalPrice,
            quantity: 1,
          };
      if (existing) {
        return prev.map((item) => (item.key === key ? nextItem : item));
      }
      return [...prev, nextItem];
    });

    if (openDrawer) {
      setCartOpen(true);
    } else {
      showToast(`Added ${selection.product.model} (${selection.storage.label}) to your bag`);
    }
  };

  const updateCartQuantity = (key: string, delta: number) => {
    setCartItems((prev) => {
      const target = prev.find((item) => item.key === key);
      if (!target) return prev;
      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((item) => item.key !== key);
      }
      const updated = { ...target, quantity: nextQty };
      return prev.map((item) => (item.key === key ? updated : item));
    });
  };

  const removeCartItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((phone) => {
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
  }, [products, searchQuery, selectedCategory, priceRange]);

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
                {loadingCatalog
                  ? 'Syncing Catalog...'
                  : `Showing ${filteredProducts.length} of ${products.length} Flagship Models`}
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
        <PartsExplorerSection parts={mobileParts} />

        {/* Section 6: Inside the Technology */}
        <TechnologySection parts={mobileParts} />

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
        onClearCart={clearCart}
      />

      {/* Non-intrusive Add-to-Bag Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-24 z-50 flex items-center gap-3 rounded-xl border border-[#D4AF37]/50 bg-[#09090B] px-4 py-3 text-xs font-medium text-[#FAFAFA] shadow-2xl">
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

      {/* Floating Green WhatsApp Button (Visible on all pages/sections) */}
      <a
        href="https://wa.me/923066238360?text=Hi%20FMK%2C%20mujhe%20mobile%20chahiye"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with FMK Mobile on WhatsApp: 03066238360"
        title="WhatsApp: 03066238360"
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform duration-200 hover:scale-105 hover:bg-[#1EBE5D] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#09090B]"
      >
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.353.615 4.651 1.784 6.678L2.56 29.59l7.072-1.855a13.28 13.28 0 0 0 6.372 1.622h.005c7.363 0 13.336-5.973 13.336-13.337 0-3.562-1.387-6.911-3.905-9.43a13.24 13.24 0 0 0-9.436-3.923zm0 24.442h-.004a11.04 11.04 0 0 1-5.631-1.542l-.404-.24-4.197 1.1 1.12-4.09-.263-.418a11.02 11.02 0 0 1-1.693-5.915c0-6.113 4.974-11.086 11.088-11.086 2.961 0 5.744 1.154 7.837 3.25a11.02 11.02 0 0 1 3.246 7.844c0 6.113-4.974 11.097-11.099 11.097zm6.08-8.308c-.333-.167-1.972-.973-2.277-1.085-.306-.111-.528-.167-.75.167-.222.333-.86 1.085-1.055 1.307-.194.223-.389.25-.722.084-.333-.167-1.407-.519-2.68-1.654-.99-.883-1.659-1.974-1.853-2.307-.194-.333-.021-.513.146-.679.15-.149.333-.389.5-.584.166-.194.222-.333.333-.556.111-.222.056-.417-.028-.584-.083-.167-.75-1.807-1.028-2.474-.27-.651-.546-.563-.75-.573l-.639-.011c-.222 0-.583.083-.889.417-.305.333-1.166 1.14-1.166 2.78 0 1.64 1.194 3.225 1.361 3.447.167.222 2.35 3.588 5.693 5.031.795.343 1.416.548 1.9.701.798.254 1.525.218 2.099.132.64-.096 1.972-.806 2.25-1.585.277-.778.277-1.445.194-1.584-.083-.139-.306-.222-.639-.389z" />
        </svg>
      </a>
    </div>
  );
}
