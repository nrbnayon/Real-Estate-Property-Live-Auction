import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Property {
  id: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  arv: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  lot_size: number
  year_built: number
  property_type: string
  description: string
  images: string[]
  status: "pending" | "approved" | "rejected" | "available" | "auction" | "sold"
  slug: string
  created_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin"
  created_at: string
  last_login?: string
  is_active: boolean
}

export interface Bid {
  id: string
  property_id: string
  property_address: string
  bid_amount: number
  confidence: number
  status: "pending" | "approved" | "rejected"
  submitted_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  submitted_at: string
}

export interface SMSLog {
  id: string
  to_number: string
  message: string
  message_type: "notification" | "alert" | "reminder" | "marketing"
  status: "sent" | "delivered" | "failed"
  sent_at: string
}
