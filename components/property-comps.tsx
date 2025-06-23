"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square, Calendar } from "lucide-react"

interface Comp {
  id: string
  address: string
  city: string
  state: string
  zip: string
  soldPrice: number
  soldDate: string
  bedrooms: number
  bathrooms: number
  sqft: number
  distance: number
  pricePerSqft: number
}

interface PropertyCompsProps {
  slug: string
}

export function PropertyComps({ slug }: PropertyCompsProps) {
  const [comps, setComps] = useState<Comp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch comps from backend API using slug
    // For now, using mock data
    const mockComps: Comp[] = [
      {
        id: "1",
        address: "1240 Desert View Dr",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        soldPrice: 265000,
        soldDate: "2023-11-15",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1420,
        distance: 0.1,
        pricePerSqft: 187,
      },
      {
        id: "2",
        address: "1256 Desert Ridge Rd",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        soldPrice: 285000,
        soldDate: "2023-10-22",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1480,
        distance: 0.2,
        pricePerSqft: 193,
      },
      {
        id: "3",
        address: "1198 Mountain View Ave",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        soldPrice: 275000,
        soldDate: "2023-12-03",
        bedrooms: 4,
        bathrooms: 2,
        sqft: 1520,
        distance: 0.3,
        pricePerSqft: 181,
      },
    ]

    setTimeout(() => {
      setComps(mockComps)
      setLoading(false)
    }, 1000)
  }, [slug])

  const avgPrice =
    comps.length > 0 ? Math.round(comps.reduce((sum, comp) => sum + comp.soldPrice, 0) / comps.length) : 0
  const avgPricePerSqft =
    comps.length > 0 ? Math.round(comps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / comps.length) : 0

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{comps.length}</div>
            <div className="text-sm text-gray-600">Comparable Sales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${avgPrice.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Average Sale Price</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${avgPricePerSqft}</div>
            <div className="text-sm text-gray-600">Avg. Price/Sqft</div>
          </CardContent>
        </Card>
      </div>

      {/* Comparable Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Comparable Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comps.map((comp) => (
              <div key={comp.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">${comp.soldPrice.toLocaleString()}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {comp.address}, {comp.city}, {comp.state} {comp.zip}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{comp.distance} mi</Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(comp.soldDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1 text-gray-400" />
                    {comp.bedrooms} beds
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1 text-gray-400" />
                    {comp.bathrooms} baths
                  </div>
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1 text-gray-400" />
                    {comp.sqft.toLocaleString()} sqft
                  </div>
                  <div className="text-right font-medium">${comp.pricePerSqft}/sqft</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>AI Valuation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Market Analysis Summary</h4>
            <p className="text-sm text-gray-700 mb-3">
              Based on {comps.length} recent comparable sales within 0.5 miles, the estimated After Repair Value (ARV)
              for this property is <strong>${avgPrice.toLocaleString()}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Price Range:</span>
                <div className="font-medium">
                  ${Math.min(...comps.map((c) => c.soldPrice)).toLocaleString()} - $
                  {Math.max(...comps.map((c) => c.soldPrice)).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Market Confidence:</span>
                <div className="font-medium text-green-600">High (87%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
