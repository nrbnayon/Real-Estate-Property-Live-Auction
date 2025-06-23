"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Building,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  address: string
  city: string
  price: number
  arv: number
  status: string
  auctionDate?: string
  bidStatus?: string
}

interface Bid {
  id: string
  propertyId: string
  propertyAddress: string
  bidAmount: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  confidence: number
}

interface TwilioMessage {
  id: string
  to: string
  message: string
  status: string
  sentAt: string
  type: "sms" | "mms"
}

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [messages, setMessages] = useState<TwilioMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // TODO: Fetch data from backend APIs
      // For now, using mock data
      const mockProperties: Property[] = [
        {
          id: "1",
          address: "1234 Desert View Dr, Phoenix, AZ",
          city: "Phoenix",
          price: 185000,
          arv: 275000,
          status: "available",
          auctionDate: "2024-01-15",
          bidStatus: "pending",
        },
        {
          id: "2",
          address: "5678 Mountain Ridge Rd, Scottsdale, AZ",
          city: "Scottsdale",
          price: 320000,
          arv: 450000,
          status: "pending",
          bidStatus: "approved",
        },
        {
          id: "3",
          address: "9012 University Ave, Tempe, AZ",
          city: "Tempe",
          price: 225000,
          arv: 325000,
          status: "available",
          bidStatus: "rejected",
        },
      ]

      const mockBids: Bid[] = [
        {
          id: "1",
          propertyId: "1",
          propertyAddress: "1234 Desert View Dr, Phoenix, AZ",
          bidAmount: 138750,
          status: "pending",
          submittedAt: "2024-01-10T10:30:00Z",
          confidence: 87,
        },
        {
          id: "2",
          propertyId: "2",
          propertyAddress: "5678 Mountain Ridge Rd, Scottsdale, AZ",
          bidAmount: 240000,
          status: "approved",
          submittedAt: "2024-01-09T14:15:00Z",
          confidence: 92,
        },
        {
          id: "3",
          propertyId: "3",
          propertyAddress: "9012 University Ave, Tempe, AZ",
          bidAmount: 168750,
          status: "rejected",
          submittedAt: "2024-01-08T09:45:00Z",
          confidence: 73,
        },
      ]

      const mockMessages: TwilioMessage[] = [
        {
          id: "1",
          to: "+1234567890",
          message: "New property alert: 1234 Desert View Dr - $185k (25% below ARV)",
          status: "delivered",
          sentAt: "2024-01-10T10:35:00Z",
          type: "sms",
        },
        {
          id: "2",
          to: "+1234567891",
          message: "Bid approved for 5678 Mountain Ridge Rd - $240k",
          status: "delivered",
          sentAt: "2024-01-09T14:20:00Z",
          type: "sms",
        },
        {
          id: "3",
          to: "+1234567892",
          message: "Skip trace complete for property owner",
          status: "delivered",
          sentAt: "2024-01-08T16:30:00Z",
          type: "sms",
        },
      ]

      setTimeout(() => {
        setProperties(mockProperties)
        setBids(mockBids)
        setMessages(mockMessages)
        setLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated.",
    })
  }

  const handleBidAction = (bidId: string, action: "approve" | "reject") => {
    setBids(
      bids.map((bid) => (bid.id === bidId ? { ...bid, status: action === "approve" ? "approved" : "rejected" } : bid)),
    )

    toast({
      title: `Bid ${action === "approve" ? "Approved" : "Rejected"}`,
      description: `The bid has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "sold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredBids = bids.filter((bid) => {
    const matchesSearch = bid.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const pendingBids = bids.filter((bid) => bid.status === "pending")
  const totalProperties = properties.length
  const totalBids = bids.length
  const avgConfidence = Math.round(bids.reduce((sum, bid) => sum + bid.confidence, 0) / bids.length)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {pendingBids.length} Pending Approvals
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Properties</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalBids}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Bids</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingBids.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Bids</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{messages.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">SMS Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search properties, addresses, or bids..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="properties" className="dark:data-[state=active]:bg-gray-700">
            Properties
          </TabsTrigger>
          <TabsTrigger value="bids" className="dark:data-[state=active]:bg-gray-700">
            Bid Management
          </TabsTrigger>
          <TabsTrigger value="messages" className="dark:data-[state=active]:bg-gray-700">
            SMS Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">All Properties ({filteredProperties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Address</TableHead>
                      <TableHead className="dark:text-gray-300">Price</TableHead>
                      <TableHead className="dark:text-gray-300">ARV</TableHead>
                      <TableHead className="dark:text-gray-300">Savings</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Auction Date</TableHead>
                      <TableHead className="dark:text-gray-300">Bid Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{property.address}</TableCell>
                        <TableCell className="dark:text-gray-300">${property.price.toLocaleString()}</TableCell>
                        <TableCell className="dark:text-gray-300">${property.arv.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-medium">
                          ${(property.arv - property.price).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {property.auctionDate ? new Date(property.auctionDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          {property.bidStatus && (
                            <Badge className={getBidStatusColor(property.bidStatus)}>{property.bidStatus}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Bid Management ({filteredBids.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Property</TableHead>
                      <TableHead className="dark:text-gray-300">Bid Amount</TableHead>
                      <TableHead className="dark:text-gray-300">Confidence</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Submitted</TableHead>
                      <TableHead className="dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBids.map((bid) => (
                      <TableRow key={bid.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{bid.propertyAddress}</TableCell>
                        <TableCell className="dark:text-gray-300">${bid.bidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                style={{ width: `${bid.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm dark:text-gray-300">{bid.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBidStatusColor(bid.status)}>{bid.status}</Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(bid.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {bid.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleBidAction(bid.id, "approve")}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBidAction(bid.id, "reject")}
                                className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Twilio SMS Logs ({messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Recipient</TableHead>
                      <TableHead className="dark:text-gray-300">Message</TableHead>
                      <TableHead className="dark:text-gray-300">Type</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{message.to}</TableCell>
                        <TableCell className="max-w-xs truncate dark:text-gray-300">{message.message}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {message.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              message.status === "delivered"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(message.sentAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
