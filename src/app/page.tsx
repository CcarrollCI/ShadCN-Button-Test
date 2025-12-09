"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [clickCount, setClickCount] = useState(0)
  const [lastClicked, setLastClicked] = useState("")
  const [isAutoClicking, setIsAutoClicking] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleButtonClick = (buttonType: string) => {
    setClickCount(prev => prev + 1)
    setLastClicked(buttonType)
  }

  const startAutoClicker = () => {
    if (!isAutoClicking) {
      setIsAutoClicking(true)
      setLastClicked("Auto Clicker")
      
      intervalRef.current = setInterval(() => {
        setClickCount(prev => prev + 1)
      }, 1000) // 1000ms = 1 second
    }
  }

  const stopAutoClicker = () => {
    if (isAutoClicking && intervalRef.current) {
      setIsAutoClicking(false)
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setLastClicked("Auto Clicker Stopped")
    }
  }

  const resetCounter = () => {
    setClickCount(0)
    setLastClicked("")
    stopAutoClicker()
  }

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        Interactive shadcn/ui Buttons!
      </h1>
      
      {/* Status Display */}
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-lg">Total Clicks: <span className="font-bold">{clickCount}</span></p>
        {lastClicked && (
          <p className="text-sm text-gray-600">Last clicked: {lastClicked}</p>
        )}
        {isAutoClicking && (
          <p className="text-sm text-green-600 font-semibold">🤖 Auto-clicking active!</p>
        )}
      </div>
      
      {/* Auto Clicker Controls */}
      <div className="flex gap-4 items-center p-4 border rounded-lg bg-blue-50">
        <Button 
          onClick={startAutoClicker}
          disabled={isAutoClicking}
          variant={isAutoClicking ? "secondary" : "default"}
        >
          {isAutoClicking ? "Auto-Clicking..." : "Start Auto Clicker"}
        </Button>
        
        <Button 
          onClick={stopAutoClicker}
          disabled={!isAutoClicking}
          variant="outline"
        >
          Stop Auto Clicker
        </Button>
      </div>
      
      {/* Test different button variants */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Button onClick={() => handleButtonClick("Default")}>
          Default Button
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => handleButtonClick("Secondary")}
        >
          Secondary
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => handleButtonClick("Destructive")}
        >
          Destructive
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleButtonClick("Outline")}
        >
          Outline
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => handleButtonClick("Ghost")}
        >
          Ghost
        </Button>
        <Button 
          variant="link" 
          onClick={() => handleButtonClick("Link")}
        >
          Link
        </Button>
      </div>
      
      {/* Test different sizes */}
      <div className="flex gap-4 items-center">
        <Button 
          size="sm" 
          onClick={() => handleButtonClick("Small")}
        >
          Small
        </Button>
        <Button 
          size="default" 
          onClick={() => handleButtonClick("Default Size")}
        >
          Default
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleButtonClick("Large")}
        >
          Large
        </Button>
      </div>
      
      {/* Special interaction buttons */}
      <div className="flex gap-4 flex-col items-center">
        <Button 
          onClick={() => alert(`You've clicked ${clickCount} buttons total!`)}
          className="mt-4"
        >
          Show Alert
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetCounter}
        >
          Reset Counter & Stop Auto
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => {
            if (confirm("Are you sure you want to do this?")) {
              alert("You confirmed! 🎉")
            }
          }}
        >
          Confirm Action
        </Button>
      </div>
    </div>
  )
}