"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Bed, Bath, Square, Calendar, Phone, Mail } from "lucide-react"
import { AIPropertyAnalysis } from "@/components/ai-property-analysis"

interface PropertyDetailsProps {
  slug: string
}

interface PropertyDetail {
  id: string
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
  status: string
  auctionDate?: string
  description: string
  features: string[]
  aiAnalysis: {
    confidence: number
    marketTrend: string
    repairEstimate: number
    timeOnMarket: number
  }
}

export function PropertyDetails({ slug }: PropertyDetailsProps) {
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // TODO: Fetch property details from backend API using slug
    // For now, using mock data
    const mockProperty: PropertyDetail = {
      id: "1",
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
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      ],
      status: "available",
      auctionDate: "2024-01-15",
      description:
        "This distressed property offers excellent investment potential in a desirable Phoenix neighborhood. The home features a spacious layout with good bones and is priced significantly below market value.",
      features: [
        "Single-story layout",
        "Large backyard",
        "Two-car garage",
        "Tile flooring",
        "Ceiling fans throughout",
        "Desert landscaping",
      ],
      aiAnalysis: {
        confidence: 87,
        marketTrend: "Rising",
        repairEstimate: 25000,
        timeOnMarket: 45,
      },
    }

    setTimeout(() => {
      setProperty(mockProperty)
      setLoading(false)
    }, 1000)
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 h-96 rounded-lg"></div>
        <div className="space-y-4">
          <div className="bg-gray-200 h-8 rounded w-3/4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          <div className="bg-gray-200 h-32 rounded"></div>
        </div>
      </div>
    )
  }

  if (!property) {
    return <div>Property not found</div>
  }

  const savings = property.arv - property.price
  const savingsPercentage = Math.round((savings / property.arv) * 100)
  const roi = Math.round(((property.arv - property.price - property.aiAnalysis.repairEstimate) / property.price) * 100)

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={property.images[currentImageIndex] || "/placeholder.svg"}
              alt={property.address}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex space-x-2 mt-4">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-20 h-16 rounded overflow-hidden ${
                  currentImageIndex === index ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <Image
                  src={
                    image ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80" ||
                    "/placeholder.svg"
                  }
                  alt={`View ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Property Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">${property.price.toLocaleString()}</CardTitle>
                  <p className="text-gray-600">ARV: ${property.arv.toLocaleString()}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{savingsPercentage}% Below ARV</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-2 text-gray-400" />
                  {property.bedrooms} Beds
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-2 text-gray-400" />
                  {property.bathrooms} Baths
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-2 text-gray-400" />
                  {property.sqft.toLocaleString()} sqft
                </div>
                <div className="text-gray-600">Built: {property.yearBuilt}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential Savings:</span>
                  <span className="font-semibold text-green-600">${savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Repairs:</span>
                  <span className="font-semibold">${property.aiAnalysis.repairEstimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential ROI:</span>
                  <span className="font-semibold text-blue-600">{roi}%</span>
                </div>
              </div>

              {property.auctionDate && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center text-orange-800">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Auction: {new Date(property.auctionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Agent
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Request Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Property Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                {property.address}, {property.city}, {property.state} {property.zip}
              </div>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        <div>
          <AIPropertyAnalysis property={property} />
        </div>
      </div>
    </div>
  )
}
