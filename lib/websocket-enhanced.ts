"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface AuctionUpdate {
  propertyId: string
  currentBid: number
  bidder: string
  timestamp: string
  timeRemaining: number
  totalBidders: number
  bidHistory: BidHistoryItem[]
  auctionStatus: "active" | "paused" | "ended"
  minimumIncrement: number
}

export interface BidHistoryItem {
  id: string
  bidAmount: number
  bidder: string
  timestamp: string
  isWinning: boolean
}

export interface PlaceBidRequest {
  type: "place_bid"
  propertyId: string
  bidAmount: number
  bidderId: string
  timestamp: string
}

export function useEnhancedAuctionWebSocket(propertyId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [auctionData, setAuctionData] = useState<AuctionUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      // Use mock WebSocket for demo purposes
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/auction"

      // For demo, we'll simulate WebSocket connection
      if (process.env.NODE_ENV === "development") {
        // Simulate connection
        setTimeout(() => {
          setIsConnected(true)
          setError(null)
          setConnectionAttempts(0)
          setIsReconnecting(false)

          // Start mock auction data updates
          startMockAuction()
        }, 1000)

        return
      }

      wsRef.current = new WebSocket(`${wsUrl}/${propertyId}`)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        setConnectionAttempts(0)
        setIsReconnecting(false)

        // Start heartbeat
        startHeartbeat()
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data: AuctionUpdate = JSON.parse(event.data)
          setAuctionData(data)
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setError("Connection error occurred")
      }

      wsRef.current.onclose = (event) => {
        setIsConnected(false)
        stopHeartbeat()

        if (!event.wasClean && connectionAttempts < 5) {
          setIsReconnecting(true)
          setConnectionAttempts((prev) => prev + 1)

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (connectionAttempts >= 5) {
          setError("Unable to connect to auction. Please refresh the page.")
        }
      }
    } catch (err) {
      setError("Failed to connect to auction")
      setIsConnected(false)
    }
  }, [propertyId, connectionAttempts])

  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }

  const startMockAuction = () => {
    // Mock auction data for demo
    let currentBid = 185000
    let timeRemaining = 3600
    const totalBidders = Math.floor(Math.random() * 8) + 3

    const mockBidders = ["Investor_A", "FlipCorp", "RealEstate_Pro", "PropertyGuru", "InvestmentLLC"]
    const bidHistory: BidHistoryItem[] = []

    const updateAuction = () => {
      if (timeRemaining <= 0) return

      // Randomly update bid (30% chance)
      if (Math.random() < 0.3) {
        const increment = [1000, 2500, 5000][Math.floor(Math.random() * 3)]
        currentBid += increment

        const bidder = mockBidders[Math.floor(Math.random() * mockBidders.length)]
        const newBid: BidHistoryItem = {
          id: Date.now().toString(),
          bidAmount: currentBid,
          bidder,
          timestamp: new Date().toISOString(),
          isWinning: true,
        }

        // Mark previous bids as not winning
        bidHistory.forEach((bid) => (bid.isWinning = false))
        bidHistory.unshift(newBid)

        // Keep only last 10 bids
        if (bidHistory.length > 10) {
          bidHistory.pop()
        }
      }

      timeRemaining -= 1

      const mockData: AuctionUpdate = {
        propertyId,
        currentBid,
        bidder: bidHistory[0]?.bidder || "System",
        timestamp: new Date().toISOString(),
        timeRemaining,
        totalBidders,
        bidHistory,
        auctionStatus: timeRemaining > 0 ? "active" : "ended",
        minimumIncrement: 1000,
      }

      setAuctionData(mockData)
    }

    // Update every second
    const interval = setInterval(updateAuction, 1000)

    // Initial data
    updateAuction()

    // Cleanup
    return () => clearInterval(interval)
  }

  const placeBid = useCallback(
    (bidAmount: number) => {
      const bidRequest: PlaceBidRequest = {
        type: "place_bid",
        propertyId,
        bidAmount,
        bidderId: "current_user", // In real app, get from auth
        timestamp: new Date().toISOString(),
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(bidRequest))
      } else {
        // For demo, simulate bid placement
        if (auctionData && bidAmount > auctionData.currentBid) {
          const newBid: BidHistoryItem = {
            id: Date.now().toString(),
            bidAmount,
            bidder: "You",
            timestamp: new Date().toISOString(),
            isWinning: true,
          }

          const updatedHistory = [...(auctionData.bidHistory || [])]
          updatedHistory.forEach((bid) => (bid.isWinning = false))
          updatedHistory.unshift(newBid)

          setAuctionData({
            ...auctionData,
            currentBid: bidAmount,
            bidder: "You",
            bidHistory: updatedHistory.slice(0, 10),
          })
        }
      }
    },
    [propertyId, auctionData],
  )

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    stopHeartbeat()
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
    }
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    auctionData,
    error,
    isReconnecting,
    connectionAttempts,
    placeBid,
    reconnect: connect,
    disconnect,
  }
}
