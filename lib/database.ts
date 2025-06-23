import { supabase } from "./supabase"
import type { Property, Bid, SMSLog, User } from "./supabase"

// Property Management
export async function createProperty(
  propertyData: Omit<Property, "id" | "slug" | "created_at" | "updated_at">,
): Promise<Property | null> {
  const slug = generateSlug(propertyData.address, propertyData.city)

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...propertyData,
      slug,
      status: "pending", // All new properties start as pending
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating property:", error)
    return null
  }

  return data
}

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching properties:", error)
    return []
  }

  return data || []
}

export async function getPropertiesByStatus(status: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching properties by status:", error)
    return []
  }

  return data || []
}

export async function updatePropertyStatus(
  propertyId: string,
  status: Property["status"],
  approvedBy?: string,
  rejectionReason?: string,
): Promise<Property | null> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "approved" && approvedBy) {
    updateData.approved_by = approvedBy
    updateData.approved_at = new Date().toISOString()
  }

  if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase.from("properties").update(updateData).eq("id", propertyId).select().single()

  if (error) {
    console.error("Error updating property status:", error)
    return null
  }

  return data
}

export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .select()
    .single()

  if (error) {
    console.error("Error updating property:", error)
    return null
  }

  return data
}

export async function deleteProperty(propertyId: string): Promise<boolean> {
  const { error } = await supabase.from("properties").delete().eq("id", propertyId)

  if (error) {
    console.error("Error deleting property:", error)
    return false
  }

  return true
}

// Bid Management
export async function createBid(bidData: Omit<Bid, "id" | "submitted_at">): Promise<Bid | null> {
  const { data, error } = await supabase.from("bids").insert(bidData).select().single()

  if (error) {
    console.error("Error creating bid:", error)
    return null
  }

  return data
}

export async function getAllBids(): Promise<Bid[]> {
  const { data, error } = await supabase.from("bids").select("*").order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching bids:", error)
    return []
  }

  return data || []
}

export async function updateBidStatus(
  bidId: string,
  status: Bid["status"],
  approvedBy?: string,
  rejectionReason?: string,
): Promise<Bid | null> {
  const updateData: any = { status }

  if (status === "approved" && approvedBy) {
    updateData.approved_by = approvedBy
    updateData.approved_at = new Date().toISOString()
  }

  if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase.from("bids").update(updateData).eq("id", bidId).select().single()

  if (error) {
    console.error("Error updating bid status:", error)
    return null
  }

  return data
}

// SMS Logs
export async function createSMSLog(smsData: Omit<SMSLog, "id" | "sent_at">): Promise<SMSLog | null> {
  const { data, error } = await supabase.from("sms_logs").insert(smsData).select().single()

  if (error) {
    console.error("Error creating SMS log:", error)
    return null
  }

  return data
}

export async function getAllSMSLogs(): Promise<SMSLog[]> {
  const { data, error } = await supabase.from("sms_logs").select("*").order("sent_at", { ascending: false })

  if (error) {
    console.error("Error fetching SMS logs:", error)
    return []
  }

  return data || []
}

// User Management
export async function createUser(userData: Omit<User, "id" | "created_at">): Promise<User | null> {
  const { data, error } = await supabase.from("users").insert(userData).select().single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data || []
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user by email:", error)
    return null
  }

  return data
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating user:", error)
    return null
  }

  return data
}

export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    console.error("Error deleting user:", error)
    return false
  }

  return true
}

// Utility Functions
function generateSlug(address: string, city: string): string {
  return `${address.toLowerCase().replace(/\s+/g, "-")}-${city.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, "")
}

// Initialize database
export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to fetch from them
    const { data: users } = await supabase.from("users").select("id").limit(1)

    if (!users) {
      console.log("Database tables need to be created. Please run the SQL script in Supabase.")
    }
  } catch (error) {
    console.error("Database initialization error:", error)
  }
}
