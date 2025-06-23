"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useEnhancedAuctionWebSocket } from "@/lib/websocket-enhanced"
import { generateBidRecommendation } from "@/lib/ai-analysis"
import { Gavel, Clock, Zap, AlertTriangle, Users, Phone, Mail, MessageSquare, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EnhancedLiveAuctionProps {
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

export function EnhancedLiveAuction({ propertyId, property }: EnhancedLiveAuctionProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  const { isConnected, auctionData, error, isReconnecting, connectionAttempts, placeBid, reconnect } =
    useEnhancedAuctionWebSocket(propertyId)

  const { toast } = useToast()

  const currentBid = auctionData?.currentBid || property.price
  const timeRemaining = auctionData?.timeRemaining || 3600
  const totalBidders = auctionData?.totalBidders || 0
  const bidHistory = auctionData?.bidHistory || []

  useEffect(() => {
    if (currentBid) {
      setBidAmount((currentBid + (auctionData?.minimumIncrement || 1000)).toString())
    }
  }, [currentBid, auctionData?.minimumIncrement])

  const handleGetAIRecommendation = async () => {
    setIsLoadingRecommendation(true)
    try {
      const recommendation = await generateBidRecommendation(property, currentBid)
      setAiRecommendation(recommendation)
      setBidAmount(recommendation.recommendedBid.toString())

      toast({
        title: "AI Recommendation Ready",
        description: `Recommended bid: $${recommendation.recommendedBid.toLocaleString()}`,
      })
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
    const minIncrement = auctionData?.minimumIncrement || 1000

    if (bid <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Your bid must be higher than the current bid of $${currentBid.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    if (bid < currentBid + minIncrement) {
      toast({
        title: "Bid Too Low",
        description: `Minimum bid increment is $${minIncrement.toLocaleString()}`,
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
      title: "Bid Placed Successfully",
      description: `Your bid of $${bid.toLocaleString()} has been submitted.`,
    })
  }

  const handleContactAgent = async (type: "agent" | "info") => {
    setIsSubmittingContact(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const message =
        type === "agent"
          ? `Agent contact request for ${property.address}`
          : `Information request for ${property.address}`

      toast({
        title: "Request Sent",
        description: `Your ${type === "agent" ? "agent contact" : "information"} request has been submitted.`,
      })

      setContactForm({ name: "", email: "", phone: "", message: "" })
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Unable to send request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeProgress = () => {
    const totalTime = 3600
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  const getConnectionStatus = () => {
    if (isReconnecting) return { color: "bg-yellow-500", text: "Reconnecting..." }
    if (isConnected) return { color: "bg-green-500", text: "Connected to Live Auction" }
    return { color: "bg-red-500", text: "Connection Lost" }
  }

  const status = getConnectionStatus()

  return (
    <div className="space-y-6">
      {/* Enhanced Connection Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></div>
              <div>
                <span className="text-sm font-medium">{status.text}</span>
                {isReconnecting && <p className="text-xs text-gray-500">Attempt {connectionAttempts}/5</p>}
              </div>
              {isConnected ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300"
              >
                <Clock className="w-3 h-3 mr-1" />
                LIVE AUCTION
              </Badge>
              {!isConnected && (
                <Button variant="outline" size="sm" onClick={reconnect}>
                  Reconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Auction Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${currentBid.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Highest Bid</div>
            {auctionData?.bidder && <div className="text-xs text-gray-500 mt-1">by {auctionData.bidder}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</div>
            <Progress value={getTimeProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6 mr-1" />
              {totalBidders}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Bidders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${(auctionData?.minimumIncrement || 1000).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Min. Increment</div>
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
                className="text-lg dark:bg-gray-800 dark:border-gray-600"
                min={currentBid + (auctionData?.minimumIncrement || 1000)}
              />
            </div>
            <Button
              onClick={handlePlaceBid}
              disabled={!isConnected || !bidAmount || auctionData?.auctionStatus === "ended"}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Gavel className="w-4 h-4 mr-2" />
              Place Bid
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setBidAmount((currentBid + 1000).toString())}
              className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              +$1,000
            </Button>
            <Button
              variant="outline"
              onClick={() => setBidAmount((currentBid + 5000).toString())}
              className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              +$5,000
            </Button>
            <Button
              variant="outline"
              onClick={() => setBidAmount((currentBid + 10000).toString())}
              className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              +$10,000
            </Button>
          </div>

          {/* AI Recommendation */}
          <div className="border-t pt-4 dark:border-gray-700">
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
                className="dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {isLoadingRecommendation ? "Analyzing..." : "Get AI Advice"}
              </Button>
            </div>

            {aiRecommendation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 border dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Recommended Bid:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    ${aiRecommendation.recommendedBid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maximum Safe Bid:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    ${aiRecommendation.maxBid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                  <Badge variant="outline" className="dark:border-gray-600">
                    {aiRecommendation.confidence}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{aiRecommendation.reasoning}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBidAmount(aiRecommendation.recommendedBid.toString())}
                  className="w-full mt-2 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Use AI Recommendation
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold mb-2">Contact Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Speak directly with our property specialist</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Contact Property Agent</DialogTitle>
              <DialogDescription>Get in touch with our specialist for {property.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="I'm interested in this property..."
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <Button onClick={() => handleContactAgent("agent")} disabled={isSubmittingContact} className="w-full">
                {isSubmittingContact ? "Sending..." : "Contact Agent"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold mb-2">Request Info</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get detailed property information packet</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Request Property Information</DialogTitle>
              <DialogDescription>Receive detailed information about {property.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="info-name">Name</Label>
                  <Input
                    id="info-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="info-email">Email</Label>
                  <Input
                    id="info-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="info-message">Specific Information Needed</Label>
                <Textarea
                  id="info-message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Please send me information about financing options, inspection reports, etc."
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <Button onClick={() => handleContactAgent("info")} disabled={isSubmittingContact} className="w-full">
                {isSubmittingContact ? "Sending..." : "Request Information"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bid History */}
      {bidHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Recent Bid Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {bidHistory.map((bid, index) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${bid.isWinning ? "bg-green-500" : "bg-gray-400"}`}></div>
                    <div>
                      <div className="font-semibold">${bid.bidAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">by {bid.bidder}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </div>
                    {bid.isWinning && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Winning
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auction Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auction Rules & Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Minimum Bid Increment:</span>
            <span className="font-medium">${(auctionData?.minimumIncrement || 1000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Buyer's Premium:</span>
            <span className="font-medium">5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Deposit Required:</span>
            <span className="font-medium">10% of winning bid</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Closing Period:</span>
            <span className="font-medium">30 days</span>
          </div>
          <Separator className="my-3" />
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> All sales are final. Properties sold "as-is" with no warranties. Conduct your
              own due diligence before bidding. By participating, you agree to our terms and conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
