"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Building, DollarSign, Clock } from "lucide-react"

interface Stats {
  totalProperties: number
  avgSavings: string
  activeBids: number
  avgProcessTime: string
}

export function StatsRow() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    avgSavings: "$0",
    activeBids: 0,
    avgProcessTime: "0 days",
  })

  useEffect(() => {
    // TODO: Fetch real stats from backend API
    // For now, using mock data
    setStats({
      totalProperties: 1247,
      avgSavings: "$47k",
      activeBids: 23,
      avgProcessTime: "3.2 days",
    })
  }, [])

  const statItems = [
    {
      icon: Building,
      label: "Total Properties",
      value: stats.totalProperties.toLocaleString(),
      color: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: "Avg. Savings",
      value: stats.avgSavings,
      color: "text-green-600",
    },
    {
      icon: TrendingUp,
      label: "Active Bids",
      value: stats.activeBids.toString(),
      color: "text-orange-600",
    },
    {
      icon: Clock,
      label: "Avg. Process Time",
      value: stats.avgProcessTime,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {statItems.map((item, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-6">
            <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
