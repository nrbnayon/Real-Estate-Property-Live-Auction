"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, DollarSign, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)

    // Build search parameters
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (priceRange) params.set("price", priceRange)
    if (location) params.set("location", location)

    // Navigate to properties page with search parameters
    const searchUrl = `/properties${params.toString() ? `?${params.toString()}` : ""}`

    try {
      router.push(searchUrl)

      toast({
        title: "Search Applied",
        description: `Found properties matching your criteria`,
      })
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Unable to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsSearching(false), 1000)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setPriceRange("")
    setLocation("")
    router.push("/properties")

    toast({
      title: "Filters Cleared",
      description: "All search filters have been reset",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section
      id="search-section"
      className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 -mt-16 relative z-20 mb-12 border dark:border-gray-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="City, ZIP, or Address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="0-100k">$0 - $100k</SelectItem>
            <SelectItem value="100k-250k">$100k - $250k</SelectItem>
            <SelectItem value="250k-500k">$250k - $500k</SelectItem>
            <SelectItem value="500k+">$500k+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="phoenix">Phoenix</SelectItem>
            <SelectItem value="scottsdale">Scottsdale</SelectItem>
            <SelectItem value="tempe">Tempe</SelectItem>
            <SelectItem value="mesa">Mesa</SelectItem>
            <SelectItem value="chandler">Chandler</SelectItem>
            <SelectItem value="glendale">Glendale</SelectItem>
            <SelectItem value="peoria">Peoria</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex-1"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>

          {(searchQuery || priceRange || location) && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Summary */}
      {(searchQuery || priceRange || location) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Active Filters:</strong>
            {searchQuery && ` Location: "${searchQuery}"`}
            {priceRange && ` Price: ${priceRange.replace("k", "K").replace("+", "+")}`}
            {location && ` Area: ${location.charAt(0).toUpperCase() + location.slice(1)}`}
          </p>
        </div>
      )}
    </section>
  )
}
