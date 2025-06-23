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

export function useFixedAuctionWebSocket(propertyId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [auctionData, setAuctionData] = useState<AuctionUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startMockAuction = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    let currentBid = 185000
    let timeRemaining = 3600
    const totalBidders = Math.floor(Math.random() * 8) + 3

    const mockBidders = ["Investor_A", "FlipCorp", "RealEstate_Pro", "PropertyGuru", "InvestmentLLC"]
    const bidHistory: BidHistoryItem[] = []

    const updateAuction = () => {
      if (timeRemaining <= 0) {
        setAuctionData((prev) => (prev ? { ...prev, auctionStatus: "ended" } : null))
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        return
      }

      // Randomly update bid (20% chance)
      if (Math.random() < 0.2) {
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
        bidHistory: [...bidHistory],
        auctionStatus: timeRemaining > 0 ? "active" : "ended",
        minimumIncrement: 1000,
      }

      setAuctionData(mockData)
    }

    // Initial connection simulation
    setTimeout(() => {
      setIsConnected(true)
      setError(null)
      setConnectionAttempts(0)
      setIsReconnecting(false)

      // Start updates
      updateAuction()
      intervalRef.current = setInterval(updateAuction, 1000)
    }, 1000)
  }, [propertyId])

  const placeBid = useCallback(
    (bidAmount: number) => {
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
    },
    [auctionData],
  )

  const reconnect = useCallback(() => {
    setIsReconnecting(true)
    setError(null)
    startMockAuction()
  }, [startMockAuction])

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsConnected(false)
  }, [])

  useEffect(() => {
    startMockAuction()
    return disconnect
  }, [startMockAuction, disconnect])

  return {
    isConnected,
    auctionData,
    error,
    isReconnecting,
    connectionAttempts,
    placeBid,
    reconnect,
    disconnect,
  }
}
