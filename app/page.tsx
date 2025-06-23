import { HeroSection } from "@/components/hero-section"
import { SearchBar } from "@/components/search-bar"
import { StatsRow } from "@/components/stats-row"
import { PropertyGrid } from "@/components/property-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <SearchBar />
        <StatsRow />
        <PropertyGrid limit={6} showViewAll />
      </div>
    </div>
  )
}
