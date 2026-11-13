import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IPHONE_PRODUCTS,
  MOBILE_PARTS,
  MobilePart,
  PartId,
  PhoneCategory,
  PhoneColorOption,
  PhoneProduct,
  SHOWCASE_FINISHES,
  StorageOption,
} from '../data/catalog';
import { CartItem } from '../components/CartDrawer';

// ============================================================================
// SUPABASE CONFIGURATION — PASTE YOUR CREDENTIALS HERE (OR USE AI STUDIO SECRETS)
// 1. Paste your Supabase Project URL into DIRECT_SUPABASE_URL
// 2. Paste your Publishable / Anon Key into DIRECT_SUPABASE_PUBLISHABLE_KEY
//    (Or set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in AI Studio Secrets)
// ============================================================================
const DIRECT_SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const DIRECT_SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY';

const cleanEnvValue = (val: string | undefined): string =>
  (val || '').trim().replace(/^["']|["']$/g, '').trim();

const isRealCredential = (val: string): boolean =>
  Boolean(val) &&
  val !== 'YOUR_SUPABASE_PROJECT_URL' &&
  val !== 'YOUR_SUPABASE_ANON_KEY' &&
  val !== 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY';

const envUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, '');
const envKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);
const directUrl = cleanEnvValue(DIRECT_SUPABASE_URL).replace(/\/+$/, '');
const directKey = cleanEnvValue(DIRECT_SUPABASE_PUBLISHABLE_KEY);

export const SUPABASE_URL = isRealCredential(envUrl) ? envUrl : directUrl;
export const SUPABASE_ANON_KEY = isRealCredential(envKey) ? envKey : directKey;

export const isSupabaseConfigured =
  isRealCredential(SUPABASE_URL) &&
  isRealCredential(SUPABASE_ANON_KEY) &&
  /^https?:\/\//i.test(SUPABASE_URL) &&
  SUPABASE_ANON_KEY.length >= 16;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface SupabaseResult<T> {
  data: T | null;
  error: string | null;
}

const SESSION_KEY = 'fmk_visitor_session_id';
const LOCAL_ORDERS_KEY = 'fmk_session_orders_v1';

export function getVisitorSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing && existing.length > 8) return existing;
    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `fmk_${crypto.randomUUID()}`
        : `fmk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return 'fmk_browser_session_default';
  }
}

function getLocalOrderNumbers(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function rememberLocalOrderNumber(orderNumber: string): void {
  try {
    const existing = getLocalOrderNumbers();
    if (!existing.includes(orderNumber)) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([orderNumber, ...existing].slice(0, 25)));
    }
  } catch {
    // ignore storage errors
  }
}

function resolveColorImage(colorName: string): string {
  const match = SHOWCASE_FINISHES.find(
    (f) => f.name.toLowerCase() === colorName.toLowerCase()
  );
  return match?.image || SHOWCASE_FINISHES[0].image;
}

// ============================================================================
// 0. NON-DESTRUCTIVE CONNECTION CHECK (Read-Only Across Existing Tables)
// ============================================================================
export async function testSupabaseConnection(): Promise<
  SupabaseResult<{ connected: boolean; productsCount: number; partsCount: number }>
> {
  if (!supabase) {
    return {
      data: null,
      error:
        'Supabase credentials not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }
  try {
    const [prodRes, partsRes, settingsRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('mobile_parts').select('id', { count: 'exact', head: true }),
      supabase.from('store_settings').select('id').limit(1),
    ]);

    const firstErr = prodRes.error || partsRes.error || settingsRes.error;
    if (firstErr) {
      return { data: null, error: firstErr.message };
    }

    return {
      data: {
        connected: true,
        productsCount: prodRes.count ?? 0,
        partsCount: partsRes.count ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Supabase connection test failed',
    };
  }
}

// ============================================================================
// 1. CATALOG (Fetch from products, product_storage_options, product_colors)
// ============================================================================
export async function fetchProductsFromSupabase(): Promise<SupabaseResult<PhoneProduct[]>> {
  if (!supabase) return { data: null, error: null };
  try {
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .order('release_year', { ascending: false });

    if (prodErr) return { data: null, error: prodErr.message };
    if (!prodRows || prodRows.length === 0) return { data: null, error: null };

    const [{ data: storageRows }, { data: colorRows }] = await Promise.all([
      supabase.from('product_storage_options').select('*').order('price_delta', { ascending: true }),
      supabase.from('product_colors').select('*'),
    ]);

    const mapped: PhoneProduct[] = prodRows.map((row) => {
      const localMatch = IPHONE_PRODUCTS.find((p) => p.id === row.id);
      const storageOptions: StorageOption[] = (storageRows || [])
        .filter((s) => s.product_id === row.id)
        .map((s) => ({
          label: s.storage_label,
          priceDelta: Number(s.price_delta),
        }));

      const colors: PhoneColorOption[] = (colorRows || [])
        .filter((c) => c.product_id === row.id)
        .map((c) => ({
          name: c.color_name,
          hex: c.hex_code,
          frameHex: c.frame_hex,
          backHex: c.back_hex,
          accentHex: c.accent_hex,
          image: resolveColorImage(c.color_name),
        }));

      return {
        id: row.id,
        model: row.model_name,
        seriesLabel: row.series_label,
        category: row.category as Exclude<PhoneCategory, 'All'>,
        basePrice: Number(row.base_price),
        releaseYear: String(row.release_year),
        tagline: row.tagline,
        description: row.description,
        chip: row.chip_spec,
        displaySpec: row.display_spec,
        cameraSpec: row.camera_spec,
        batterySpec: row.battery_spec,
        materialSpec: row.material_spec,
        cameraCount: (Number(row.camera_count) === 2 ? 2 : 3) as 2 | 3,
        defaultImage: colors[0]?.image || localMatch?.defaultImage || SHOWCASE_FINISHES[0].image,
        storageOptions:
          storageOptions.length > 0
            ? storageOptions
            : localMatch?.storageOptions || [{ label: '256GB', priceDelta: 0 }],
        colors: colors.length > 0 ? colors : localMatch?.colors || [SHOWCASE_FINISHES[0]],
      };
    });

    return { data: mapped, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unable to load products from Supabase',
    };
  }
}

// ============================================================================
// 2. MOBILE PARTS (Fetch from mobile_parts)
// ============================================================================
export async function fetchMobilePartsFromSupabase(): Promise<SupabaseResult<MobilePart[]>> {
  if (!supabase) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('mobile_parts')
      .select('*')
      .order('part_index', { ascending: true });

    if (error) return { data: null, error: error.message };
    if (!data || data.length === 0) return { data: null, error: null };

    const mapped: MobilePart[] = data.map((row) => {
      const local = MOBILE_PARTS.find((p) => p.id === row.id) || MOBILE_PARTS[0];
      const specs = Array.isArray(row.engineering_specs)
        ? row.engineering_specs.map((s: unknown) => String(s).trim()).filter(Boolean)
        : typeof row.engineering_specs === 'string'
        ? row.engineering_specs.split('|').map((s: string) => s.trim()).filter(Boolean)
        : local.engineeringSpecs;

      return {
        id: row.id as PartId,
        index: row.part_index,
        name: row.part_name,
        subsystem: row.subsystem,
        shortDescription: row.short_description,
        functionExplanation: row.function_explanation,
        engineeringSpecs: specs.length > 0 ? specs : local.engineeringSpecs,
        image: local.image,
        explodedOffset: [
          Number(row.explode_offset_x),
          Number(row.explode_offset_y),
          Number(row.explode_offset_z),
        ],
        focusTarget: local.focusTarget,
        focusCameraOffset: local.focusCameraOffset,
      };
    });

    return { data: mapped, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unable to load mobile parts from Supabase',
    };
  }
}

// ============================================================================
// 3. STORE SETTINGS (Read & User-Initiated Update on store_settings)
// ============================================================================
export interface StoreSettingsPayload {
  id?: number;
  contact_number: string;
  business_address: string;
}

export async function fetchStoreSettingsFromSupabase(): Promise<
  SupabaseResult<StoreSettingsPayload>
> {
  if (!supabase) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('id, contact_number, business_address')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: null };
    return {
      data: {
        id: data.id,
        contact_number: data.contact_number,
        business_address: data.business_address,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to load store settings',
    };
  }
}

export async function saveStoreSettingsToSupabase(
  contactNumber: string,
  businessAddress: string
): Promise<SupabaseResult<boolean>> {
  if (!supabase) return { data: true, error: null };
  try {
    const { data: existing } = await supabase
      .from('store_settings')
      .select('id')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing?.id != null) {
      const { error } = await supabase
        .from('store_settings')
        .update({
          contact_number: contactNumber,
          business_address: businessAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) return { data: null, error: error.message };
      return { data: true, error: null };
    }

    const { error } = await supabase.from('store_settings').insert({
      website_name: 'FMK Mobile Website',
      company_name: 'FMK',
      owner_name: 'Faria (FARIA)',
      contact_number: contactNumber,
      business_address: businessAddress,
      updated_at: new Date().toISOString(),
    });
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update store settings',
    };
  }
}

// ============================================================================
// 4. ORDERS & ORDER ITEMS (Insert & Session Lookup on orders, order_items)
// ============================================================================
export interface OrderSummaryRecord {
  id: number;
  order_number: string;
  customer_name: string;
  payment_method: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

export async function saveOrderToSupabase(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: 'cod' | 'card';
  totalAmount: number;
  items: CartItem[];
}): Promise<SupabaseResult<OrderSummaryRecord>> {
  if (!supabase) {
    return {
      data: null,
      error:
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets.',
    };
  }

  try {
    const sessionId = getVisitorSessionId();
    const basePayload = {
      order_number: params.orderNumber,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      delivery_address: params.deliveryAddress,
      payment_method: params.paymentMethod,
      total_amount: params.totalAmount,
      order_status: 'Confirmed',
    };

    // Attempt insert with session_id; fallback gracefully if orders table has no session_id column
    let orderInsert = await supabase
      .from('orders')
      .insert({ ...basePayload, session_id: sessionId })
      .select('id, order_number, customer_name, payment_method, total_amount, order_status, created_at')
      .single();

    if (
      orderInsert.error &&
      orderInsert.error.message.toLowerCase().includes('session_id')
    ) {
      orderInsert = await supabase
        .from('orders')
        .insert(basePayload)
        .select('id, order_number, customer_name, payment_method, total_amount, order_status, created_at')
        .single();
    }

    if (orderInsert.error || !orderInsert.data) {
      return {
        data: null,
        error: orderInsert.error?.message || 'Unable to save order in Supabase',
      };
    }

    const orderData = orderInsert.data as OrderSummaryRecord;
    rememberLocalOrderNumber(orderData.order_number);

    const lineItems = params.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      storage_label: item.storage.label,
      color_name: item.color.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    }));

    if (lineItems.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(lineItems);
      if (itemsError) {
        return { data: null, error: itemsError.message };
      }
    }

    return { data: orderData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Checkout failed',
    };
  }
}

export async function fetchSessionOrdersFromSupabase(): Promise<
  SupabaseResult<OrderSummaryRecord[]>
> {
  if (!supabase) return { data: [], error: null };
  try {
    const sessionId = getVisitorSessionId();
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, payment_method, total_amount, order_status, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!error) {
      return { data: (data || []) as OrderSummaryRecord[], error: null };
    }

    if (error.message.toLowerCase().includes('session_id')) {
      const orderNumbers = getLocalOrderNumbers();
      if (orderNumbers.length === 0) return { data: [], error: null };
      const fallback = await supabase
        .from('orders')
        .select('id, order_number, customer_name, payment_method, total_amount, order_status, created_at')
        .in('order_number', orderNumbers)
        .order('created_at', { ascending: false });
      if (fallback.error) return { data: null, error: fallback.error.message };
      return { data: (fallback.data || []) as OrderSummaryRecord[], error: null };
    }

    return { data: null, error: error.message };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to load orders',
    };
  }
}

// ============================================================================
// 5. CONTACT US INQUIRIES (Insert into contact_inquiries)
// ============================================================================
export async function saveInquiryToSupabase(params: {
  senderName: string;
  senderEmail: string;
  topic: string;
  message: string;
}): Promise<SupabaseResult<boolean>> {
  if (!supabase) {
    return {
      data: null,
      error:
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets and restart the app.',
    };
  }
  try {
    const { error } = await supabase.from('contact_inquiries').insert({
      sender_name: params.senderName,
      sender_email: params.senderEmail,
      topic: params.topic,
      message: params.message,
    });
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to send inquiry',
    };
  }
}
