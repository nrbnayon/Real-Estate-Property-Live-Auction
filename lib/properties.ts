export interface Property {
  id: string
  slug: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  arv: number
  bedrooms: number
  bathrooms: number
  sqft: number
  lotSize: string
  yearBuilt: number
  images: string[]
  status: "available" | "pending" | "sold" | "auction"
  auctionDate?: string
  description: string
  features: string[]
  propertyType: "single-family" | "condo" | "townhouse" | "multi-family"
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Mock database
const properties: Property[] = []

export function createProperty(propertyData: Omit<Property, "id" | "slug" | "createdAt" | "updatedAt">): Property {
  const slug = generateSlug(propertyData.address, propertyData.city)

  const newProperty: Property = {
    ...propertyData,
    id: `prop-${Date.now()}`,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  properties.push(newProperty)
  return newProperty
}

export function getAllProperties(): Property[] {
  return properties
}

export function getPropertyById(id: string): Property | null {
  return properties.find((p) => p.id === id) || null
}

export function getPropertyBySlug(slug: string): Property | null {
  return properties.find((p) => p.slug === slug) || null
}

export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  const propertyIndex = properties.findIndex((p) => p.id === id)
  if (propertyIndex === -1) return null

  properties[propertyIndex] = {
    ...properties[propertyIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return properties[propertyIndex]
}

export function deleteProperty(id: string): boolean {
  const propertyIndex = properties.findIndex((p) => p.id === id)
  if (propertyIndex === -1) return false

  properties.splice(propertyIndex, 1)
  return true
}

function generateSlug(address: string, city: string): string {
  return `${address.toLowerCase().replace(/\s+/g, "-")}-${city.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, "")
}

// Seed some initial properties
export function seedProperties() {
  if (properties.length === 0) {
    const sampleProperties = [
      {
        address: "1234 Desert View Dr",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        price: 185000,
        arv: 275000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1450,
        lotSize: "0.25 acres",
        yearBuilt: 1995,
        images: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available" as const,
        auctionDate: "2024-01-15",
        description: "Distressed property with excellent investment potential in desirable Phoenix neighborhood.",
        features: ["Single-story layout", "Large backyard", "Two-car garage", "Tile flooring"],
        propertyType: "single-family" as const,
        createdBy: "admin-1",
      },
    ]

    sampleProperties.forEach((prop) => createProperty(prop))
  }
}
