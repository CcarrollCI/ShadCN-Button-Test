"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ClickData {
  time: string
  timestamp: number
  totalClicks: number
  buttonType: string
}

export default function Home() {
  const [clickCount, setClickCount] = useState(0)
  const [lastClicked, setLastClicked] = useState("")
  const [isAutoClicking, setIsAutoClicking] = useState(false)
  const [showGraph, setShowGraph] = useState(false)
  const [clickHistory, setClickHistory] = useState<ClickData[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleButtonClick = (buttonType: string) => {
    const newCount = clickCount + 1
    const now = new Date()
    
    setClickCount(newCount)
    setLastClicked(buttonType)
    
    // Add to click history
    setClickHistory(prev => [...prev, {
      time: now.toLocaleTimeString(),
      timestamp: now.getTime(),
      totalClicks: newCount,
      buttonType: buttonType
    }])
  }

  const startAutoClicker = () => {
    if (!isAutoClicking) {
      setIsAutoClicking(true)
      setLastClicked("Auto Clicker")
      
      intervalRef.current = setInterval(() => {
        const newCount = clickCount + 1
        const now = new Date()
        
        setClickCount(prev => {
          const updatedCount = prev + 1
          setClickHistory(prevHistory => [...prevHistory, {
            time: now.toLocaleTimeString(),
            timestamp: now.getTime(),
            totalClicks: updatedCount,
            buttonType: "Auto Clicker"
          }])
          return updatedCount
        })
      }, 1000)
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
    setClickHistory([])
    stopAutoClicker()
  }

  // Get button type frequency data for bar chart
  const getButtonTypeData = () => {
    const buttonTypes: { [key: string]: number } = {}
    
    clickHistory.forEach(click => {
      buttonTypes[click.buttonType] = (buttonTypes[click.buttonType] || 0) + 1
    })
    
    return Object.entries(buttonTypes).map(([buttonType, count]) => ({
      buttonType,
      count
    }))
  }

  // Get last 20 clicks for line chart (to keep it readable)
  const getRecentClicksData = () => {
    return clickHistory.slice(-20).map((click, index) => ({
      ...click,
      clickNumber: clickHistory.length - 19 + index
    }))
  }

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
      
      {/* Graph Toggle Button */}
      <Button 
        onClick={() => setShowGraph(!showGraph)}
        variant="default"
        className="bg-purple-600 hover:bg-purple-700"
      >
        {showGraph ? "Hide" : "Show"} Click Analytics 📊
      </Button>

      {/* Analytics Dashboard */}
      {showGraph && clickHistory.length > 0 && (
        <div className="w-full max-w-6xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Click Analytics Dashboard</CardTitle>
              <CardDescription>
                Visual representation of your button clicking activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Line Chart - Clicks Over Time */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Clicks Over Time (Last 20)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getRecentClicksData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `Time: ${value}`}
                      formatter={(value, name) => [value, "Total Clicks"]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalClicks" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                      name="Total Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Button Type Frequency */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Button Type Frequency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getButtonTypeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="buttonType" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="#82ca9d" 
                      name="Click Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showGraph && clickHistory.length === 0 && (
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-500">No click data yet. Start clicking buttons to see analytics!</p>
          </CardContent>
        </Card>
      )}
      
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
          onClick={() => {
            alert(`You've clicked ${clickCount} buttons total!`)
            handleButtonClick("Alert Button")
          }}
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
              handleButtonClick("Confirm Action")
            }
          }}
        >
          Confirm Action
        </Button>
      </div>
    </div>
  )
}