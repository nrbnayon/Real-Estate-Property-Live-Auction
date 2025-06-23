"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuctionWebSocket } from "@/lib/websocket"
import { generateBidRecommendation } from "@/lib/ai-analysis"
import { Gavel, Clock, Zap, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LiveAuctionProps {
  propertyId: string
  property: {
    address: string
    city: string
    state: string
    price: number
    arv: number
    bedrooms: number
    bathrooms: number
    sqft: number
    yearBuilt: number
    lotSize: string
    features: string[]
  }
}

export function LiveAuction({ propertyId, property }: LiveAuctionProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const { isConnected, auctionData, error, placeBid } = useAuctionWebSocket(propertyId)
  const { toast } = useToast()

  const currentBid = auctionData?.currentBid || property.price
  const timeRemaining = auctionData?.timeRemaining || 3600 // 1 hour default
  const totalBidders = auctionData?.totalBidders || 0

  useEffect(() => {
    if (currentBid) {
      setBidAmount((currentBid + 1000).toString())
    }
  }, [currentBid])

  const handleGetAIRecommendation = async () => {
    setIsLoadingRecommendation(true)
    try {
      const recommendation = await generateBidRecommendation(property, currentBid)
      setAiRecommendation(recommendation)
      setBidAmount(recommendation.recommendedBid.toString())
    } catch (error) {
      toast({
        title: "AI Recommendation Failed",
        description: "Unable to get AI bid recommendation. Please bid manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const handlePlaceBid = () => {
    const bid = Number.parseInt(bidAmount)
    if (bid <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current bid.",
        variant: "destructive",
      })
      return
    }

    if (bid > property.arv * 0.9) {
      toast({
        title: "High Risk Bid",
        description: "This bid exceeds 90% of ARV. Consider the risks carefully.",
        variant: "destructive",
      })
    }

    placeBid(bid)
    toast({
      title: "Bid Placed",
      description: `Your bid of $${bid.toLocaleString()} has been submitted.`,
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeProgress = () => {
    const totalTime = 3600 // Assuming 1 hour auctions
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm font-medium">{isConnected ? "Connected to Live Auction" : "Connecting..."}</span>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Clock className="w-3 h-3 mr-1" />
          LIVE AUCTION
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auction Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${currentBid.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Current Highest Bid</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-gray-600">Time Remaining</div>
            <Progress value={getTimeProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalBidders}</div>
            <div className="text-sm text-gray-600">Active Bidders</div>
          </CardContent>
        </Card>
      </div>

      {/* Bidding Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gavel className="w-5 h-5 mr-2" />
            Place Your Bid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handlePlaceBid}
              disabled={!isConnected || !bidAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              <Gavel className="w-4 h-4 mr-2" />
              Place Bid
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setBidAmount((currentBid + 1000).toString())} className="flex-1">
              +$1,000
            </Button>
            <Button variant="outline" onClick={() => setBidAmount((currentBid + 5000).toString())} className="flex-1">
              +$5,000
            </Button>
            <Button variant="outline" onClick={() => setBidAmount((currentBid + 10000).toString())} className="flex-1">
              +$10,000
            </Button>
          </div>

          {/* AI Recommendation */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                AI Bid Recommendation
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAIRecommendation}
                disabled={isLoadingRecommendation}
              >
                {isLoadingRecommendation ? "Analyzing..." : "Get AI Advice"}
              </Button>
            </div>

            {aiRecommendation && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recommended Bid:</span>
                  <span className="font-semibold text-blue-600">
                    ${aiRecommendation.recommendedBid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maximum Safe Bid:</span>
                  <span className="font-semibold text-red-600">${aiRecommendation.maxBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Badge variant="outline">{aiRecommendation.confidence}%</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">{aiRecommendation.reasoning}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBidAmount(aiRecommendation.recommendedBid.toString())}
                  className="w-full mt-2"
                >
                  Use AI Recommendation
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auction Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auction Rules & Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Bid Increment:</span>
            <span className="font-medium">$1,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Buyer's Premium:</span>
            <span className="font-medium">5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deposit Required:</span>
            <span className="font-medium">10% of winning bid</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Closing Period:</span>
            <span className="font-medium">30 days</span>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> All sales are final. Properties sold "as-is" with no warranties. Conduct your
              own due diligence before bidding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
