import { PropertyDetails } from "@/components/property-details"
import { PropertyComps } from "@/components/property-comps"
import { PropertyMap } from "@/components/property-map"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PropertyPageProps {
  params: {
    slug: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
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
            <BreadcrumbPage>Property Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PropertyDetails slug={params.slug} />

      <Tabs defaultValue="comps" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comps">AI Comp Analysis</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        <TabsContent value="comps">
          <PropertyComps slug={params.slug} />
        </TabsContent>
        <TabsContent value="map">
          <PropertyMap slug={params.slug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
