"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyForm } from "@/components/property-form"
import { UserManagement } from "@/components/user-management"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building,
  Plus,
  TrendingUp,
  MessageSquare,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Gavel,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import {
  getAllProperties,
  getAllBids,
  getAllSMSLogs,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  updateBidStatus,
  deleteProperty,
  initializeDatabase,
} from "@/lib/database"
import type { Property, Bid, SMSLog } from "@/lib/supabase"

export function EnhancedAdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    initializeDatabase()
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [propertiesData, bidsData, smsData] = await Promise.all([getAllProperties(), getAllBids(), getAllSMSLogs()])

      setProperties(propertiesData)
      setBids(bidsData)
      setSmsLogs(smsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data. Please check your database connection.",
        variant: "destructive",
      })
    } finally {
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

  const handleCreateProperty = async (propertyData: any) => {
    try {
      const newProperty = await createProperty({
        ...propertyData,
        created_by: session?.user?.id || "system",
      })

      if (newProperty) {
        setProperties((prev) => [newProperty, ...prev])
        setIsCreateDialogOpen(false)
        toast({
          title: "Property Created",
          description: `${newProperty.address} has been created and is pending approval.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error Creating Property",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProperty = async (propertyData: any) => {
    if (!editingProperty) return

    try {
      const updated = await updateProperty(editingProperty.id, propertyData)
      if (updated) {
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditingProperty(null)
        toast({
          title: "Property Updated",
          description: `${updated.address} has been updated successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error Updating Property",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePropertyAction = async (propertyId: string, action: "approve" | "reject" | "available" | "auction") => {
    try {
      let status: Property["status"]
      switch (action) {
        case "approve":
          status = "approved"
          break
        case "reject":
          status = "rejected"
          break
        case "available":
          status = "available"
          break
        case "auction":
          status = "auction"
          break
        default:
          return
      }

      const updated = await updatePropertyStatus(
        propertyId,
        status,
        session?.user?.id,
        action === "reject" ? rejectionReason : undefined,
      )

      if (updated) {
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setRejectionReason("")
        toast({
          title: `Property ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Updated"}`,
          description: `The property has been ${action}d successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} property. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleBidAction = async (bidId: string, action: "approve" | "reject") => {
    try {
      const updated = await updateBidStatus(
        bidId,
        action === "approve" ? "approved" : "rejected",
        session?.user?.id,
        action === "reject" ? rejectionReason : undefined,
      )

      if (updated) {
        setBids((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        setRejectionReason("")
        toast({
          title: `Bid ${action === "approve" ? "Approved" : "Rejected"}`,
          description: `The bid has been ${action}d successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} bid. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const success = await deleteProperty(propertyId)
      if (success) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId))
        toast({
          title: "Property Deleted",
          description: "Property has been deleted successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "auction":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "sold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  // Filter functions
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredBids = bids.filter((bid) => {
    const matchesSearch = bid.property_address.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalProperties = properties.length
  const pendingProperties = properties.filter((p) => p.status === "pending").length
  const availableProperties = properties.filter((p) => p.status === "available").length
  const auctionProperties = properties.filter((p) => p.status === "auction").length
  const pendingBids = bids.filter((b) => b.status === "pending").length
  const avgSavings =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + (p.arv - p.price), 0) / properties.length)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          {pendingProperties > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {pendingProperties} Pending Approval{pendingProperties > 1 ? "s" : ""}
            </Badge>
          )}
          {pendingBids > 0 && (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
              {pendingBids} Pending Bid{pendingBids > 1 ? "s" : ""}
            </Badge>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Property</DialogTitle>
              </DialogHeader>
              <PropertyForm onSubmit={handleCreateProperty} onCancel={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingProperties}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{availableProperties}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gavel className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{auctionProperties}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Auction</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${avgSavings.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Savings</div>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="auction">Auction</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
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
            Properties ({filteredProperties.length})
          </TabsTrigger>
          <TabsTrigger value="bids" className="dark:data-[state=active]:bg-gray-700">
            Bid Management ({filteredBids.length})
          </TabsTrigger>
          <TabsTrigger value="sms" className="dark:data-[state=active]:bg-gray-700">
            SMS Logs ({smsLogs.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700">
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Property Management ({filteredProperties.length})</CardTitle>
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
                      <TableHead className="dark:text-gray-300">Created</TableHead>
                      <TableHead className="dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">
                          <div>
                            <div>{property.address}</div>
                            <div className="text-sm text-gray-500">
                              {property.city}, {property.state}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">${property.price.toLocaleString()}</TableCell>
                        <TableCell className="dark:text-gray-300">${property.arv.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-medium">
                          ${(property.arv - property.price).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(property.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {property.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handlePropertyAction(property.id, "approve")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-red-600">
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Property</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Please provide a reason for rejecting this property.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-2">
                                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                      <Textarea
                                        id="rejection-reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handlePropertyAction(property.id, "reject")}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Reject Property
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}

                            {property.status === "approved" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handlePropertyAction(property.id, "available")}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Make Available
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handlePropertyAction(property.id, "auction")}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Start Auction
                                </Button>
                              </>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setEditingProperty(property)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Property</DialogTitle>
                                </DialogHeader>
                                {editingProperty && (
                                  <PropertyForm
                                    property={editingProperty}
                                    onSubmit={handleUpdateProperty}
                                    onCancel={() => setEditingProperty(null)}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this property? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProperty(property.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Property
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
                        <TableCell className="font-medium dark:text-white">{bid.property_address}</TableCell>
                        <TableCell className="dark:text-gray-300">${bid.bid_amount.toLocaleString()}</TableCell>
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
                          <Badge className={getStatusColor(bid.status)}>{bid.status}</Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(bid.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {bid.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleBidAction(bid.id, "approve")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Bid</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Please provide a reason for rejecting this bid.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-2">
                                    <Label htmlFor="bid-rejection-reason">Rejection Reason</Label>
                                    <Textarea
                                      id="bid-rejection-reason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Enter reason for rejection..."
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleBidAction(bid.id, "reject")}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject Bid
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

        <TabsContent value="sms">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">SMS Logs ({smsLogs.length})</CardTitle>
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
                    {smsLogs.map((message) => (
                      <TableRow key={message.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{message.to_number}</TableCell>
                        <TableCell className="max-w-xs truncate dark:text-gray-300">{message.message}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {message.message_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              message.status === "delivered"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : message.status === "sent"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(message.sent_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}


// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { PropertyForm } from "@/components/property-form";
// import { UserManagement } from "@/components/user-management";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Building,
//   Plus,
//   TrendingUp,
//   MessageSquare,
//   Clock,
//   RefreshCw,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   createProperty,
//   getAllProperties,
//   updateProperty,
//   deleteProperty,
//   seedProperties,
// } from "@/lib/properties";
// import type { Property } from "@/lib/properties";

// export function EnhancedAdminDashboard() {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [editingProperty, setEditingProperty] = useState<Property | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { toast } = useToast();

//   // Fix hydration by ensuring client-side only rendering after mount
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (mounted) {
//       loadData();
//     }
//   }, [mounted]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       // Seed properties if none exist
//       seedProperties();
//       setProperties(getAllProperties());
//     } catch (error) {
//       toast({
//         title: "Error Loading Data",
//         description: "Failed to load dashboard data. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await loadData();
//     setIsRefreshing(false);
//     toast({
//       title: "Data Refreshed",
//       description: "Dashboard data has been updated.",
//     });
//   };

//   const handleCreateProperty = (propertyData: any) => {
//     try {
//       const newProperty = createProperty({
//         ...propertyData,
//         createdBy: "current-admin", // In real app, get from session
//       });
//       setProperties((prev) => [...prev, newProperty]);
//       setIsCreateDialogOpen(false);
//       toast({
//         title: "Property Created",
//         description: `${newProperty.address} has been created successfully.`,
//       });
//     } catch (error) {
//       toast({
//         title: "Error Creating Property",
//         description: "Failed to create property. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleUpdateProperty = (propertyData: any) => {
//     if (!editingProperty) return;

//     try {
//       const updated = updateProperty(editingProperty.id, propertyData);
//       if (updated) {
//         setProperties((prev) =>
//           prev.map((p) => (p.id === updated.id ? updated : p))
//         );
//         setEditingProperty(null);
//         toast({
//           title: "Property Updated",
//           description: `${updated.address} has been updated successfully.`,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error Updating Property",
//         description: "Failed to update property. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDeleteProperty = (property: Property) => {
//     if (confirm("Are you sure you want to delete this property?")) {
//       deleteProperty(property.id);
//       setProperties((prev) => prev.filter((p) => p.id !== property.id));
//       toast({
//         title: "Property Deleted",
//         description: "Property has been deleted successfully.",
//       });
//     }
//   };

//   // Prevent hydration mismatch by not rendering until mounted
//   if (!mounted) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {Array.from({ length: 4 }).map((_, index) => (
//             <div key={index} className="animate-pulse">
//               <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
//             </div>
//           ))}
//         </div>
//         <div className="animate-pulse">
//           <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
//         </div>
//       </div>
//     );
//   }

//   const totalProperties = properties.length;
//   const availableProperties = properties.filter(
//     (p) => p.status === "available"
//   ).length;
//   const auctionProperties = properties.filter(
//     (p) => p.status === "auction"
//   ).length;
//   const avgSavings =
//     properties.length > 0
//       ? Math.round(
//           properties.reduce((sum, p) => sum + (p.arv - p.price), 0) /
//             properties.length
//         )
//       : 0;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//           Admin Dashboard
//         </h1>
//         <div className="flex items-center space-x-3">
//           <Dialog
//             open={isCreateDialogOpen}
//             onOpenChange={setIsCreateDialogOpen}
//           >
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Property
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Create New Property</DialogTitle>
//               </DialogHeader>
//               <PropertyForm
//                 onSubmit={handleCreateProperty}
//                 onCancel={() => setIsCreateDialogOpen(false)}
//               />
//             </DialogContent>
//           </Dialog>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="dark:border-gray-600 dark:hover:bg-gray-700"
//           >
//             <RefreshCw
//               className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Enhanced Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="dark:bg-gray-800 dark:border-gray-700">
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//               <div className="ml-4">
//                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {totalProperties}
//                 </div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   Total Properties
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="dark:bg-gray-800 dark:border-gray-700">
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
//               <div className="ml-4">
//                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {availableProperties}
//                 </div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   Available
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="dark:bg-gray-800 dark:border-gray-700">
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
//               <div className="ml-4">
//                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {auctionProperties}
//                 </div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   In Auction
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="dark:bg-gray-800 dark:border-gray-700">
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
//               <div className="ml-4">
//                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                   ${avgSavings.toLocaleString()}
//                 </div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">
//                   Avg. Savings
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Main Content Tabs */}
//       <Tabs defaultValue="properties" className="space-y-4">
//         <TabsList className="dark:bg-gray-800">
//           <TabsTrigger
//             value="properties"
//             className="dark:data-[state=active]:bg-gray-700"
//           >
//             Properties
//           </TabsTrigger>
//           <TabsTrigger
//             value="users"
//             className="dark:data-[state=active]:bg-gray-700"
//           >
//             User Management
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="properties">
//           <Card className="dark:bg-gray-800 dark:border-gray-700">
//             <CardHeader>
//               <CardTitle className="dark:text-white">
//                 Property Management ({properties.length})
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {properties.map((property) => (
//                   <Card
//                     key={property.id}
//                     className="dark:bg-gray-700 dark:border-gray-600"
//                   >
//                     <CardContent className="p-4">
//                       <div className="space-y-3">
//                         <div className="flex justify-between items-start">
//                           <h3 className="font-semibold text-gray-900 dark:text-white truncate">
//                             {property.address}
//                           </h3>
//                           <Badge
//                             className={
//                               property.status === "available"
//                                 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//                                 : property.status === "auction"
//                                 ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
//                                 : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
//                             }
//                           >
//                             {property.status}
//                           </Badge>
//                         </div>

//                         <div className="text-sm text-gray-600 dark:text-gray-400">
//                           {property.city}, {property.state}
//                         </div>

//                         <div className="grid grid-cols-2 gap-2 text-sm">
//                           <div>
//                             <span className="text-gray-600 dark:text-gray-400">
//                               Price:
//                             </span>
//                             <div className="font-semibold">
//                               ${property.price.toLocaleString()}
//                             </div>
//                           </div>
//                           <div>
//                             <span className="text-gray-600 dark:text-gray-400">
//                               ARV:
//                             </span>
//                             <div className="font-semibold">
//                               ${property.arv.toLocaleString()}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="text-sm">
//                           <span className="text-gray-600 dark:text-gray-400">
//                             Savings:
//                           </span>
//                           <div className="font-semibold text-green-600 dark:text-green-400">
//                             ${(property.arv - property.price).toLocaleString()}
//                           </div>
//                         </div>

//                         <div className="flex space-x-2">
//                           <Dialog>
//                             <DialogTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => setEditingProperty(property)}
//                               >
//                                 Edit
//                               </Button>
//                             </DialogTrigger>
//                             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                               <DialogHeader>
//                                 <DialogTitle>Edit Property</DialogTitle>
//                               </DialogHeader>
//                               {editingProperty && (
//                                 <PropertyForm
//                                   property={editingProperty}
//                                   onSubmit={handleUpdateProperty}
//                                   onCancel={() => setEditingProperty(null)}
//                                 />
//                               )}
//                             </DialogContent>
//                           </Dialog>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-red-600 hover:text-red-700"
//                             onClick={() => handleDeleteProperty(property)}
//                           >
//                             Delete
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="users">
//           <UserManagement />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
