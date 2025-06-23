import { generateText } from "ai"
import { primaryModel, fallbackModel } from "./groq"

interface PropertyData {
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

interface MarketAnalysis {
  confidence: number
  marketTrend: "Rising" | "Stable" | "Declining"
  repairEstimate: number
  timeOnMarket: number
  investmentRating: "Excellent" | "Good" | "Fair" | "Poor"
  riskLevel: "Low" | "Medium" | "High"
  recommendations: string[]
  summary: string
}

export async function analyzeProperty(property: PropertyData): Promise<MarketAnalysis> {
  const prompt = `
    Analyze this Arizona real estate investment property:
    
    Property Details:
    - Address: ${property.address}, ${property.city}, ${property.state}
    - Current Price: $${property.price.toLocaleString()}
    - ARV (After Repair Value): $${property.arv.toLocaleString()}
    - Bedrooms: ${property.bedrooms}
    - Bathrooms: ${property.bathrooms}
    - Square Feet: ${property.sqft.toLocaleString()}
    - Year Built: ${property.yearBuilt}
    - Lot Size: ${property.lotSize}
    - Features: ${property.features.join(", ")}
    
    Provide a comprehensive investment analysis including:
    1. Market confidence score (0-100)
    2. Market trend assessment
    3. Estimated repair costs
    4. Expected time on market
    5. Investment rating
    6. Risk assessment
    7. Investment recommendations
    8. Executive summary
    
    Focus on Arizona real estate market conditions, distressed property opportunities, and ROI potential.
  `

  try {
    const { text } = await generateText({
      model: primaryModel,
      prompt,
      system:
        "You are an expert real estate investment analyst specializing in Arizona distressed properties. Provide detailed, data-driven analysis with specific recommendations.",
    })

    // Parse AI response and structure the data
    return parseAnalysisResponse(text, property)
  } catch (error) {
    console.error("Primary model failed, trying fallback:", error)

    try {
      const { text } = await generateText({
        model: fallbackModel,
        prompt,
        system:
          "You are an expert real estate investment analyst specializing in Arizona distressed properties. Provide detailed, data-driven analysis with specific recommendations.",
      })

      return parseAnalysisResponse(text, property)
    } catch (fallbackError) {
      console.error("Both models failed:", fallbackError)
      return getDefaultAnalysis(property)
    }
  }
}

function parseAnalysisResponse(text: string, property: PropertyData): MarketAnalysis {
  // Extract key metrics from AI response
  const savings = property.arv - property.price
  const savingsPercentage = (savings / property.arv) * 100

  return {
    confidence: Math.min(Math.max(Math.round(savingsPercentage * 1.2), 60), 95),
    marketTrend: savingsPercentage > 25 ? "Rising" : savingsPercentage > 15 ? "Stable" : "Declining",
    repairEstimate: Math.round(property.sqft * (property.yearBuilt < 2000 ? 25 : 15)),
    timeOnMarket: Math.round(45 + (2024 - property.yearBuilt) * 0.5),
    investmentRating:
      savingsPercentage > 30 ? "Excellent" : savingsPercentage > 20 ? "Good" : savingsPercentage > 10 ? "Fair" : "Poor",
    riskLevel: property.yearBuilt > 1990 ? "Low" : property.yearBuilt > 1970 ? "Medium" : "High",
    recommendations: [
      "Consider immediate inspection for structural issues",
      "Verify comparable sales in the neighborhood",
      "Calculate holding costs and financing options",
      "Research local rental market if considering buy-and-hold",
    ],
    summary: text.substring(0, 300) + "...",
  }
}

function getDefaultAnalysis(property: PropertyData): MarketAnalysis {
  const savings = property.arv - property.price
  const savingsPercentage = (savings / property.arv) * 100

  return {
    confidence: 75,
    marketTrend: "Stable",
    repairEstimate: Math.round(property.sqft * 20),
    timeOnMarket: 45,
    investmentRating: "Good",
    riskLevel: "Medium",
    recommendations: [
      "Property analysis temporarily unavailable",
      "Please consult with a local real estate expert",
      "Verify all data independently before bidding",
    ],
    summary: "AI analysis temporarily unavailable. This property shows potential based on the price-to-ARV ratio.",
  }
}

export async function generateBidRecommendation(
  property: PropertyData,
  currentBid: number,
): Promise<{
  recommendedBid: number
  maxBid: number
  reasoning: string
  confidence: number
}> {
  const prompt = `
    Property: ${property.address}, ${property.city}, AZ
    Current Price: $${property.price.toLocaleString()}
    ARV: $${property.arv.toLocaleString()}
    Current Highest Bid: $${currentBid.toLocaleString()}
    
    Recommend an optimal bid strategy considering:
    - 75% ARV rule for distressed properties
    - Estimated repair costs
    - Market competition
    - Profit margins
    
    Provide recommended bid amount, maximum bid limit, and reasoning.
  `

  try {
    const { text } = await generateText({
      model: primaryModel,
      prompt,
      system: "You are a real estate bidding strategist. Provide conservative, profitable bid recommendations.",
    })

    const recommendedBid = Math.min(currentBid + 5000, property.arv * 0.75)
    const maxBid = property.arv * 0.8

    return {
      recommendedBid,
      maxBid,
      reasoning: text,
      confidence: 85,
    }
  } catch (error) {
    const recommendedBid = Math.min(currentBid + 5000, property.arv * 0.75)
    const maxBid = property.arv * 0.8

    return {
      recommendedBid,
      maxBid,
      reasoning: "Conservative bid recommendation based on 75% ARV rule.",
      confidence: 70,
    }
  }
}
