"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 500000])
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [status, setStatus] = useState<string[]>([])

  // Initialize filters from URL params
  useEffect(() => {
    const price = searchParams.get("price")
    const beds = searchParams.get("bedrooms")
    const baths = searchParams.get("bathrooms")
    const type = searchParams.get("propertyType")
    const statusParam = searchParams.get("status")

    if (price) {
      const [min, max] = price.split("-").map(Number)
      setPriceRange([min || 0, max || 500000])
    }
    if (beds) setBedrooms(beds)
    if (baths) setBathrooms(baths)
    if (type) setPropertyType(type)
    if (statusParam) setStatus(statusParam.split(","))
  }, [searchParams])

  const handleStatusChange = (statusValue: string, checked: boolean) => {
    if (checked) {
      setStatus([...status, statusValue])
    } else {
      setStatus(status.filter((s) => s !== statusValue))
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear existing filter params
    params.delete("price")
    params.delete("bedrooms")
    params.delete("bathrooms")
    params.delete("propertyType")
    params.delete("status")

    // Add new filter params
    if (priceRange[0] > 0 || priceRange[1] < 500000) {
      params.set("price", `${priceRange[0]}-${priceRange[1]}`)
    }
    if (bedrooms) params.set("bedrooms", bedrooms)
    if (bathrooms) params.set("bathrooms", bathrooms)
    if (propertyType) params.set("propertyType", propertyType)
    if (status.length > 0) params.set("status", status.join(","))

    router.push(`/properties?${params.toString()}`)
  }

  const handleReset = () => {
    setPriceRange([0, 500000])
    setBedrooms("")
    setBathrooms("")
    setPropertyType("")
    setStatus([])

    // Keep search query but remove filters
    const params = new URLSearchParams()
    const q = searchParams.get("q")
    const location = searchParams.get("location")

    if (q) params.set("q", q)
    if (location) params.set("location", location)

    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const hasActiveFilters =
    priceRange[0] > 0 || priceRange[1] < 500000 || bedrooms || bathrooms || propertyType || status.length > 0

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filter Properties</CardTitle>
          {hasActiveFilters && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {
                [
                  priceRange[0] > 0 || priceRange[1] < 500000 ? "Price" : null,
                  bedrooms ? "Beds" : null,
                  bathrooms ? "Baths" : null,
                  propertyType ? "Type" : null,
                  status.length > 0 ? "Status" : null,
                ].filter(Boolean).length
              }{" "}
              active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="mt-2">
            <Slider value={priceRange} onValueChange={setPriceRange} max={500000} step={10000} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <Label className="text-sm font-medium">Bedrooms</Label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bathrooms */}
        <div>
          <Label className="text-sm font-medium">Bathrooms</Label>
          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div>
          <Label className="text-sm font-medium">Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-2 space-y-2">
            {["available", "pending", "auction", "sold"].map((statusOption) => (
              <div key={statusOption} className="flex items-center space-x-2">
                <Checkbox
                  id={statusOption}
                  checked={status.includes(statusOption)}
                  onCheckedChange={(checked) => handleStatusChange(statusOption, checked as boolean)}
                />
                <Label htmlFor={statusOption} className="text-sm capitalize">
                  {statusOption}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div>
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 500000])} />
                </Badge>
              )}
              {bedrooms && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {bedrooms}+ beds
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBedrooms("")} />
                </Badge>
              )}
              {bathrooms && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {bathrooms}+ baths
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBathrooms("")} />
                </Badge>
              )}
              {propertyType && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {propertyType.replace("-", " ")}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPropertyType("")} />
                </Badge>
              )}
              {status.map((s) => (
                <Badge key={s} variant="outline" className="flex items-center gap-1">
                  {s}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setStatus(status.filter((st) => st !== s))} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" onClick={applyFilters}>
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" className="w-full" onClick={handleReset}>
              Reset Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
