import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square, TrendingUp, Calendar, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const savings = property.arv - property.price
  const savingsPercentage = Math.round((savings / property.arv) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/property/${property.slug}`}>
          <Image
            src={
              property.images[0] ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80" ||
              "/placeholder.svg"
            }
            alt={property.address}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
        </Link>
        <div className="absolute top-2 left-2">
          <Badge className={getStatusColor(property.status)}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-blue-600 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            {savingsPercentage}% Below ARV
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Link href={`/property/${property.slug}`}>
              <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                {property.address}
              </h3>
            </Link>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {property.city}, {property.state} {property.zip}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">${property.price.toLocaleString()}</div>
              <div className="text-sm text-gray-600">ARV: ${property.arv.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">${savings.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {property.bedrooms}
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {property.bathrooms}
              </div>
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                {property.sqft.toLocaleString()}
              </div>
            </div>
          </div>

          {property.auctionDate && (
            <div className="flex items-center text-sm text-orange-600">
              <Calendar className="w-4 h-4 mr-1" />
              Auction: {new Date(property.auctionDate).toLocaleDateString()}
            </div>
          )}

          {property.status === "available" && (
            <div className="mt-3">
              <Button asChild size="sm" className="w-full bg-red-600 hover:bg-red-700">
                <Link href={`/auction/${property.id}`}>
                  <Gavel className="w-4 h-4 mr-2" />
                  Join Live Auction
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
