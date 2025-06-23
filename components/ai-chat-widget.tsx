// components/ai-chat-widget.tsx
"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message only on client side
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm your AZ Deal Hub AI assistant. I can help you with questions about properties, auctions, bidding strategies, pricing analysis, and more. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

// Fixed streaming response parsing in handleSendMessage function

const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: inputMessage.trim(),
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  const currentInput = inputMessage.trim(); // Store the input before clearing
  setInputMessage("");
  setIsLoading(true);

  try {
    // Build messages array for the API
    const conversationMessages = [
      {
        role: "system" as const,
        content: `You are an AI assistant for AZ Deal Hub, a real estate acquisition platform focused on distressed properties in Arizona. You help users with:

1. Property Analysis & Valuation
2. Auction Strategies & Bidding
3. Investment Calculations (ROI, ARV, repair estimates)
4. Market Trends in Arizona
5. Platform Features & Navigation
6. Real Estate Investment Education

Key Platform Features:
- AI-powered property analysis using Groq AI
- Live auction system with real-time bidding
- Automated comparable sales analysis
- Property filtering and search
- Admin dashboard for property management
- User authentication and bid tracking
- SMS notifications via Twilio

Be helpful, knowledgeable about real estate investing, and specific to Arizona markets. Keep responses concise but informative.`,
      },
      // Add conversation history (excluding the welcome message)
      ...messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      // Add the current user message
      {
        role: "user" as const,
        content: currentInput,
      },
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationMessages,
      }),
    });

    // console.log("Chat Response::", response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let assistantContent = "";

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Stream the response
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        // Handle different line formats from the AI SDK
        if (line.startsWith("0:")) {
          // This is a text delta chunk
          try {
            const textChunk = line.slice(2); // Remove "0:" prefix
            
            // The chunk might be JSON or plain text
            let textDelta = "";
            if (textChunk.startsWith('"') && textChunk.endsWith('"')) {
              // It's a JSON string, parse it
              textDelta = JSON.parse(textChunk);
            } else {
              // It's plain text
              textDelta = textChunk;
            }
            
            if (textDelta) {
              assistantContent += textDelta;
              // Update the assistant message with accumulated content
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch (e) {
            console.warn("Failed to parse text chunk:", line, e);
            // If parsing fails, treat it as plain text
            const textDelta = line.slice(2);
            if (textDelta) {
              assistantContent += textDelta;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          }
        } else if (line.startsWith("f:") || line.startsWith("e:") || line.startsWith("d:")) {
          // These are metadata lines, we can log them but don't need to process for UI
          // console.log("Metadata:", line);
        }
      }
    }

    // If no content was received, show an error
    if (!assistantContent.trim()) {
      throw new Error("No response content received from AI");
    }

  } catch (error) {
    console.error("AI Chat Error:", error);

    let errorContent =
      "I apologize, but I'm having trouble connecting to the AI service right now.";

    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("GROQ_API_KEY")
      ) {
        setHasApiKey(false);
        errorContent =
          "The AI service is not properly configured. Please check that your GROQ_API_KEY is set correctly in your environment variables and restart the development server.";
      } else if (error.message.includes("rate limit")) {
        errorContent =
          "The AI service is currently rate limited. Please try again in a moment.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorContent =
          "There's a network issue connecting to the AI service. Please check your internet connection and try again.";
      } else if (error.message.includes("500")) {
        errorContent =
          "The AI service encountered an internal error. Please try again in a moment.";
      }
    }

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: errorContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Badge
          className={`absolute -top-2 -left-2 ${
            hasApiKey ? "bg-green-500" : "bg-red-500"
          } text-white animate-pulse`}
        >
          AI
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`w-80 shadow-xl transition-all duration-300 ${
          isMinimized ? "h-16" : "h-96"
        }`}
      >
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm">AZ Deal Hub AI</CardTitle>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  hasApiKey ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {hasApiKey ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === "assistant" && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === "user" && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    hasApiKey
                      ? "Ask about properties, auctions, bidding..."
                      : "AI service unavailable"
                  }
                  className="flex-1"
                  disabled={isLoading || !hasApiKey}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !hasApiKey}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
