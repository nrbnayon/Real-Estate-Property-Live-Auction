"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Property {
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
  images: string[]
  status: string
  auctionDate?: string
}

interface PropertyGridProps {
  limit?: number
  showViewAll?: boolean
}

export function PropertyGrid({ limit, showViewAll = false }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get("q")
  const priceRange = searchParams.get("price")
  const location = searchParams.get("location")

  useEffect(() => {
    // TODO: Fetch properties from backend API
    // For now, using mock data
    const mockProperties: Property[] = [
      {
        id: "1",
        slug: "phoenix-distressed-home-1",
        address: "1234 Desert View Dr",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        price: 185000,
        arv: 275000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1450,
        images: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available",
        auctionDate: "2024-01-15",
      },
      {
        id: "2",
        slug: "scottsdale-foreclosure-2",
        address: "5678 Mountain Ridge Rd",
        city: "Scottsdale",
        state: "AZ",
        zip: "85251",
        price: 320000,
        arv: 450000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2100,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
        ],
        status: "pending",
        auctionDate: "2024-01-18",
      },
      {
        id: "3",
        slug: "tempe-investment-property-3",
        address: "9012 University Ave",
        city: "Tempe",
        state: "AZ",
        zip: "85281",
        price: 225000,
        arv: 325000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        images: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available",
      },
      {
        id: "4",
        slug: "mesa-distressed-4",
        address: "3456 Main Street",
        city: "Mesa",
        state: "AZ",
        zip: "85201",
        price: 165000,
        arv: 240000,
        bedrooms: 3,
        bathrooms: 1,
        sqft: 1100,
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available",
      },
      {
        id: "5",
        slug: "chandler-foreclosure-5",
        address: "7890 Innovation Dr",
        city: "Chandler",
        state: "AZ",
        zip: "85225",
        price: 295000,
        arv: 420000,
        bedrooms: 4,
        bathrooms: 2,
        sqft: 1800,
        images: [
          "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available",
      },
      {
        id: "6",
        slug: "glendale-opportunity-6",
        address: "2468 Sunset Blvd",
        city: "Glendale",
        state: "AZ",
        zip: "85301",
        price: 175000,
        arv: 260000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1350,
        images: [
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        ],
        status: "available",
      },
    ]

    setTimeout(() => {
      setProperties(mockProperties)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = [...properties]

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (property) =>
          property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.zip.includes(searchQuery),
      )
    }

    // Price range filter
    if (priceRange) {
      filtered = filtered.filter((property) => {
        switch (priceRange) {
          case "0-100k":
            return property.price <= 100000
          case "100k-250k":
            return property.price > 100000 && property.price <= 250000
          case "250k-500k":
            return property.price > 250000 && property.price <= 500000
          case "500k+":
            return property.price > 500000
          default:
            return true
        }
      })
    }

    // Location filter
    if (location) {
      filtered = filtered.filter((property) => property.city.toLowerCase() === location.toLowerCase())
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    setFilteredProperties(filtered)
  }, [properties, searchQuery, priceRange, location, limit])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading properties...</span>
        </div>
      </div>
    )
  }

  const hasFilters = searchQuery || priceRange || location

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {showViewAll ? "Featured Properties" : "All Properties"}
          </h2>
          {hasFilters && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredProperties.length} properties found
              </span>
              {searchQuery && (
                <Badge variant="outline" className="dark:border-gray-600">
                  Search: {searchQuery}
                </Badge>
              )}
              {priceRange && (
                <Badge variant="outline" className="dark:border-gray-600">
                  Price: {priceRange.replace("k", "K").replace("+", "+")}
                </Badge>
              )}
              {location && (
                <Badge variant="outline" className="dark:border-gray-600">
                  Location: {location.charAt(0).toUpperCase() + location.slice(1)}
                </Badge>
              )}
            </div>
          )}
        </div>
        {showViewAll && (
          <Button asChild variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-700">
            <Link href="/properties">View All Properties</Link>
          </Button>
        )}
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or browse all available properties.
          </p>
          <Button asChild variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-700">
            <Link href="/properties">View All Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
