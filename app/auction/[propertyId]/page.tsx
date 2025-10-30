import { EnhancedLiveAuction } from "@/components/enhanced-live-auction"
import { PropertyDetails } from "@/components/property-details"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface AuctionPageProps {
  params: {
    propertyId: string
  }
}

export default function AuctionPage({ params }: AuctionPageProps) {
  // TODO: Fetch property data from backend API
  const mockProperty = {
    id: params.propertyId,
    address: "1234 Desert View Dr",
    city: "Phoenix",
    state: "AZ",
    zip: "85001",
    price: 185000,
    arv: 275000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1450,
    yearBuilt: 1995,
    lotSize: "0.25 acres",
    features: [
      "Single-story layout",
      "Large backyard",
      "Two-car garage",
      "Tile flooring",
      "Ceiling fans throughout",
      "Desert landscaping",
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/properties">Properties</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Live Auction</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Property Auction</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {mockProperty?.address}, {mockProperty?.city}, {mockProperty?.state}
        </p>
      </div>

      <Tabs defaultValue="auction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auction">Live Auction</TabsTrigger>
          <TabsTrigger value="details">Property Details</TabsTrigger>
        </TabsList>

        <TabsContent value="auction">
          <EnhancedLiveAuction propertyId={params?.propertyId} property={mockProperty} />
        </TabsContent>

        <TabsContent value="details">
          <PropertyDetails slug={`property-${params?.propertyId}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
