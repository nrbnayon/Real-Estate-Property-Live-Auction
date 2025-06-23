"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PropertyMapProps {
  slug: string
}

export function PropertyMap({ slug }: PropertyMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // TODO: Initialize map with property location and comps
    // For now, simulating map load
    setTimeout(() => {
      setMapLoaded(true)
    }, 1500)
  }, [slug])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Location & Neighborhood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            {mapLoaded ? (
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Interactive Map</div>
                <p className="text-gray-600">
                  Map integration with property location, comparable sales, and neighborhood data
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  • Property location marker
                  <br />• Comparable sales within 0.5 miles
                  <br />• School districts and amenities
                  <br />• Crime and safety data
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neighborhood Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Median Home Value:</span>
              <span className="font-medium">$285,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price Trend (12mo):</span>
              <span className="font-medium text-green-600">+8.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days on Market:</span>
              <span className="font-medium">32 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Walk Score:</span>
              <span className="font-medium">72/100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nearby Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Elementary School:</span>
              <span className="font-medium">0.3 mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shopping Center:</span>
              <span className="font-medium">0.8 mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hospital:</span>
              <span className="font-medium">2.1 mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highway Access:</span>
              <span className="font-medium">1.2 mi</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
