"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from 'recharts'

interface ClickData {
  time: string
  timestamp: number
  totalClicks: number
  buttonType: string
}

interface ClicksPerMinuteData {
  minute: string
  clicksPerMinute: number
  timestamp: number
  totalClicksAtEnd: number
}

const chartConfig = {
  clicksPerMinute: {
    label: "Clicks per Minute",
    color: "#60a5fa", // Light blue color
  },
} satisfies ChartConfig

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

  // Calculate clicks per minute over time
  const getClicksPerMinuteData = (): ClicksPerMinuteData[] => {
    if (clickHistory.length === 0) return []

    const minuteMap = new Map<string, { count: number, timestamp: number, totalClicks: number }>()
    
    clickHistory.forEach((click, index) => {
      const date = new Date(click.timestamp)
      // Round down to the nearest minute
      const minuteKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
                                date.getHours(), date.getMinutes(), 0).getTime()
      const minuteString = new Date(minuteKey).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      if (!minuteMap.has(minuteString)) {
        minuteMap.set(minuteString, { 
          count: 0, 
          timestamp: minuteKey,
          totalClicks: 0
        })
      }
      
      const existing = minuteMap.get(minuteString)!
      existing.count += 1
      existing.totalClicks = index + 1 // Total clicks up to this point
    })

    // Convert to array and sort by timestamp
    return Array.from(minuteMap.entries())
      .map(([minute, data]) => ({
        minute,
        clicksPerMinute: data.count,
        timestamp: data.timestamp,
        totalClicksAtEnd: data.totalClicks
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const clicksPerMinuteData = getClicksPerMinuteData()
  const currentCPM = clicksPerMinuteData.length > 0 ? clicksPerMinuteData[clicksPerMinuteData.length - 1].clicksPerMinute : 0
  const avgCPM = clicksPerMinuteData.length > 0 ? 
    (clicksPerMinuteData.reduce((sum, data) => sum + data.clicksPerMinute, 0) / clicksPerMinuteData.length).toFixed(1) : 0

  return (
    <div className="dark min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-6 text-foreground">
        <h1 className="text-4xl font-bold text-center mb-8">
          Interactive shadcn/ui Buttons!
        </h1>
        
        {/* Status Display */}
        <div className="text-center p-4 bg-card border rounded-lg">
          <p className="text-lg">Total Clicks: <span className="font-bold">{clickCount}</span></p>
          {lastClicked && (
            <p className="text-sm text-muted-foreground">Last clicked: {lastClicked}</p>
          )}
          {isAutoClicking && (
            <p className="text-sm text-green-400 font-semibold">🤖 Auto-clicking active!</p>
          )}
          <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
            <span>Current CPM: <span className="text-blue-400 font-semibold">{currentCPM}</span></span>
            <span>Avg CPM: <span className="text-purple-400 font-semibold">{avgCPM}</span></span>
          </div>
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
          <div className="w-full max-w-7xl space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Click Analytics Dashboard</CardTitle>
                <CardDescription>
                  Clicks per minute over time - {clickHistory.length} total clicks across {clicksPerMinuteData.length} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* shadcn Line Chart - Clicks Per Minute */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Clicks Per Minute Over Time</h3>
                  <ChartContainer config={chartConfig}>
                    <LineChart
                      accessibilityLayer
                      data={clicksPerMinuteData}
                      margin={{
                        top: 20,
                        left: 12,
                        right: 12,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid vertical={false} className="stroke-muted" />
                      <XAxis
                        dataKey="minute"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="fill-muted-foreground"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                          hideLabel={false}
                          labelFormatter={(value, payload) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload as ClicksPerMinuteData
                              return `Time: ${data.minute} | ${data.clicksPerMinute} clicks this minute | Total: ${data.totalClicksAtEnd}`
                            }
                            return value
                          }}
                        />}
                      />
                      <Line
                        dataKey="clicksPerMinute"
                        type="monotone"
                        stroke="#60a5fa" // Light blue line
                        strokeWidth={3}
                        dot={{
                          fill: "#60a5fa", // Light blue dots
                          strokeWidth: 2,
                          r: 5,
                        }}
                        activeDot={{
                          r: 8,
                          fill: "#93c5fd", // Slightly lighter blue for active dot
                          stroke: "#60a5fa",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                {/* Bar Chart - Button Type Frequency */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Button Type Frequency</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getButtonTypeData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="buttonType" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        className="fill-muted-foreground"
                      />
                      <YAxis className="fill-muted-foreground" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        fill="#60a5fa" // Light blue bars
                        name="Click Count"
                        stroke="#3b82f6" // Darker blue border for bars
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-blue-400">{clickHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-green-400">
                      {new Set(clickHistory.map(click => click.buttonType)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Different Buttons</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{avgCPM}</p>
                    <p className="text-sm text-muted-foreground">Avg CPM</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-orange-400">
                      {Math.max(...clicksPerMinuteData.map(d => d.clicksPerMinute), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Peak CPM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showGraph && clickHistory.length === 0 && (
          <Card className="w-full max-w-md border-border">
            <CardContent className="text-center p-6">
              <p className="text-muted-foreground">No click data yet. Start clicking buttons to see analytics!</p>
            </CardContent>
          </Card>
        )}
        
        {/* Auto Clicker Controls */}
        <div className="flex gap-4 items-center p-4 border border-border rounded-lg bg-card">
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
    </div>
  )
}