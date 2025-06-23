"use client"

import { useEffect, useRef, useState } from "react"

export interface AuctionUpdate {
  propertyId: string
  currentBid: number
  bidder: string
  timestamp: string
  timeRemaining: number
  totalBidders: number
}

export function useAuctionWebSocket(propertyId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [auctionData, setAuctionData] = useState<AuctionUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // TODO: Replace with your actual WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/auction"

    try {
      wsRef.current = new WebSocket(`${wsUrl}/${propertyId}`)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setError(null)
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
        setError("WebSocket connection error")
        setIsConnected(false)
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
      }
    } catch (err) {
      setError("Failed to connect to auction")
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [propertyId])

  const placeBid = (bidAmount: number) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "place_bid",
          propertyId,
          bidAmount,
          timestamp: new Date().toISOString(),
        }),
      )
    }
  }

  return {
    isConnected,
    auctionData,
    error,
    placeBid,
  }
}
