import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CartItem } from '../components/CartDrawer';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const isConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20;

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface StoreSettingsPayload {
  contact_number: string;
  business_address: string;
}

export async function fetchStoreSettingsFromSupabase(): Promise<StoreSettingsPayload | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('contact_number, business_address')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      contact_number: data.contact_number,
      business_address: data.business_address,
    };
  } catch {
    return null;
  }
}

export async function saveStoreSettingsToSupabase(
  contactNumber: string,
  businessAddress: string
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('store_settings').upsert({
      id: 1,
      website_name: 'FMK Mobile Website',
      company_name: 'FMK',
      owner_name: 'Faria (FARIA)',
      contact_number: contactNumber,
      business_address: businessAddress,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Graceful local fallback already active
  }
}

export async function saveOrderToSupabase(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: 'cod' | 'card';
  totalAmount: number;
  items: CartItem[];
}): Promise<void> {
  if (!supabase) return;
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: params.orderNumber,
        customer_name: params.customerName,
        customer_phone: params.customerPhone,
        delivery_address: params.deliveryAddress,
        payment_method: params.paymentMethod,
        total_amount: params.totalAmount,
        order_status: 'Confirmed',
      })
      .select('id')
      .single();

    if (orderError || !orderData) return;

    const lineItems = params.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      storage_label: item.storage.label,
      color_name: item.color.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    }));

    if (lineItems.length > 0) {
      await supabase.from('order_items').insert(lineItems);
    }
  } catch {
    // Graceful fallback if Supabase table/RLS is not yet initialized
  }
}

export async function saveInquiryToSupabase(params: {
  senderName: string;
  senderEmail: string;
  topic: string;
  message: string;
}): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('contact_inquiries').insert({
      sender_name: params.senderName,
      sender_email: params.senderEmail,
      topic: params.topic,
      message: params.message,
    });
  } catch {
    // Graceful fallback
  }
}
