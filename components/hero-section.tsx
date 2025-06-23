"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, X } from "lucide-react"
import { useState, useRef } from "react"

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoToggle = () => {
    if (!isVideoPlaying) {
      setIsVideoPlaying(true)
      setIsVideoLoaded(true)
      // Simulate video loading
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play()
        }
      }, 500)
    } else {
      setIsVideoPlaying(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }

  const handleCloseVideo = () => {
    setIsVideoPlaying(false)
    setIsVideoLoaded(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <section className="relative h-[70vh] bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-950 dark:to-blue-800 flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40">
        {isVideoPlaying ? (
          <div className="relative w-full h-full bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
            {isVideoLoaded ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" controls autoPlay muted loop>
                  <source
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
                  onClick={handleCloseVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading video...</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center opacity-80 dark:opacity-60"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80)",
            }}
          />
        )}
      </div>

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
          AI-Powered Real Estate
          <br />
          <span className="text-blue-300 dark:text-blue-200">Acquisition Platform</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-blue-100 dark:text-blue-50 drop-shadow-md">
          Discover distressed property opportunities in Arizona with automated comps, intelligent bidding, and
          streamlined acquisition workflows.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 shadow-lg"
            onClick={() => document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Properties
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white/80 text-white bg-white/10 hover:bg-white hover:text-blue-900 dark:hover:bg-gray-100 dark:hover:text-blue-950 px-8 py-3 backdrop-blur-sm shadow-lg"
            onClick={handleVideoToggle}
          >
            {isVideoPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Demo
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
