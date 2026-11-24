export type PricingModel = 'HOURLY' | 'DAILY' | 'PROJECT';
export type Mode = 'ONSITE' | 'REMOTE' | 'BOTH';
export interface Profile {
  id: string; full_name: string; avatar_url: string; bio: string;
  province: string; city: string; district: string; social_url: string;
  wa_verified: boolean; status: 'ACTIVE' | 'SUSPENDED'; is_admin: boolean;
  completed_orders: number; rating_sum: number; rating_count: number; created_at: string;
}
export interface Service {
  id: string; provider_id: string; category: string; subcategory: string; categories: string[]; items: string[]; title: string; description: string;
  price_hourly: number | null; price_daily: number | null; price_project: number | null;
  warranty_days: number; warranty_desc: string; mode: Mode;
  province: string; city: string; district: string; tags: string[]; is_active: boolean; created_at: string;
}
export interface JobRequest {
  id: string; buyer_id: string; title: string; description: string; category: string; item: string; mode: Mode;
  province: string; city: string; district: string; pricing_model: PricingModel; budget: number;
  status: 'OPEN' | 'CLOSED'; created_at: string;
}
export interface Bid {
  id: string; request_id: string; provider_id: string; pricing_model: PricingModel; price: number;
  duration: string; warranty_days: number; warranty_desc: string; note: string;
  status: 'PENDING' | 'ACCEPTED'; created_at: string;
}
export type OrderStatus = 'AGREEMENT' | 'IN_PROGRESS' | 'DONE_WARRANTY' | 'CLAIM' | 'CLOSED';
export interface Order {
  id: string; title: string; service_id: string | null; request_id: string | null;
  buyer_id: string; provider_id: string; pricing_model: PricingModel; agreed_price: number;
  dp_percent: number; payment_terms: string; scope: string; warranty_days: number; warranty_desc: string;
  status: OrderStatus; buyer_ok: boolean; provider_ok: boolean;
  done_at: string | null; warranty_ends_at: string | null; claim_note: string;
  rating: number | null; review: string; created_at: string;
}
export interface Report {
  id: string; reporter_id: string; target_id: string; reason: string; evidence: string;
  status: 'PENDING' | 'VALID' | 'REJECTED'; created_at: string;
}
export interface ModLog {
  id: string; user_id: string; kind: 'service' | 'request'; title: string;
  verdict: 'APPROVED' | 'REJECTED'; reason: string; created_at: string;
}
