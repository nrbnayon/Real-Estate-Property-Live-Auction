"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { analyzeProperty } from "@/lib/ai-analysis"
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

interface AIPropertyAnalysisProps {
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

export function AIPropertyAnalysis({ property }: AIPropertyAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await analyzeProperty(property)
      setAnalysis(result)
    } catch (err) {
      setError("Failed to analyze property. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-analyze on component mount
    handleAnalyze()
  }, [])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-600 bg-green-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "High":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "text-green-600 bg-green-100"
      case "Good":
        return "text-blue-600 bg-blue-100"
      case "Fair":
        return "text-yellow-600 bg-yellow-100"
      case "Poor":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Property Analysis
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Refresh Analysis"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center p-3 bg-red-50 rounded-lg text-red-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Confidence Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Confidence Score</span>
                <span className="font-bold text-lg">{analysis.confidence}%</span>
              </div>
              <Progress value={analysis.confidence} className="h-3" />
              <p className="text-xs text-gray-600 mt-1">
                Based on market data, comparable sales, and property characteristics
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Investment Rating:</span>
                  <Badge className={getRatingColor(analysis.investmentRating)}>{analysis.investmentRating}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Level:</span>
                  <Badge className={getRiskColor(analysis.riskLevel)}>{analysis.riskLevel}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Trend:</span>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                    <span className="font-medium">{analysis.marketTrend}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. Time on Market:</span>
                  <span className="font-medium">{analysis.timeOnMarket} days</span>
                </div>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Financial Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium">${property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Repair Costs:</span>
                  <span className="font-medium">${analysis.repairEstimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investment:</span>
                  <span className="font-medium">${(property.price + analysis.repairEstimate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">ARV:</span>
                  <span className="font-bold text-green-600">${property.arv.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential Profit:</span>
                  <span className="font-bold text-green-600">
                    ${(property.arv - property.price - analysis.repairEstimate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-semibold mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Executive Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
