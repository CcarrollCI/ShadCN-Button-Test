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

interface ClicksPerMinuteByTypeData {
  minute: string
  timestamp: number
  [key: string]: string | number // For dynamic button type counts
}

const chartConfig = {
  default: {
    label: "Default",
    color: "#60a5fa", // Light blue
  },
  secondary: {
    label: "Secondary",
    color: "#f59e0b", // Amber
  },
  destructive: {
    label: "Destructive",
    color: "#ef4444", // Red
  },
  outline: {
    label: "Outline",
    color: "#10b981", // Green
  },
  ghost: {
    label: "Ghost",
    color: "#a855f7", // Purple
  },
  link: {
    label: "Link",
    color: "#ec4899", // Pink
  },
  small: {
    label: "Small",
    color: "#06b6d4", // Cyan
  },
  "default size": {
    label: "Default Size",
    color: "#84cc16", // Lime
  },
  large: {
    label: "Large",
    color: "#f97316", // Orange
  },
  "auto clicker": {
    label: "Auto Clicker",
    color: "#6366f1", // Indigo
  },
  "alert button": {
    label: "Alert Button",
    color: "#8b5cf6", // Violet
  },
  "confirm action": {
    label: "Confirm Action",
    color: "#e11d48", // Rose
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

  // Calculate clicks per minute by button type
  const getClicksPerMinuteByTypeData = (): ClicksPerMinuteByTypeData[] => {
    if (clickHistory.length === 0) return []

    // Get all unique button types
    const buttonTypes = [...new Set(clickHistory.map(click => click.buttonType.toLowerCase()))]
    
    const minuteMap = new Map<string, { timestamp: number, [key: string]: number }>()
    
    clickHistory.forEach((click) => {
      const date = new Date(click.timestamp)
      const minuteKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
                                date.getHours(), date.getMinutes(), 0).getTime()
      const minuteString = new Date(minuteKey).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      if (!minuteMap.has(minuteString)) {
        const newEntry: { timestamp: number, [key: string]: number } = { timestamp: minuteKey }
        buttonTypes.forEach(type => {
          newEntry[type] = 0
        })
        minuteMap.set(minuteString, newEntry)
      }
      
      const existing = minuteMap.get(minuteString)!
      const buttonKey = click.buttonType.toLowerCase()
      existing[buttonKey] = (existing[buttonKey] || 0) + 1
    })

    // Convert to array and sort by timestamp
    return Array.from(minuteMap.entries())
      .map(([minute, data]) => ({
        minute,
        timestamp: data.timestamp,
        ...Object.fromEntries(
          Object.entries(data).filter(([key]) => key !== 'timestamp')
        )
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  // Get all unique button types from history
  const getUniqueButtonTypes = () => {
    return [...new Set(clickHistory.map(click => click.buttonType.toLowerCase()))]
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const clicksPerMinuteByTypeData = getClicksPerMinuteByTypeData()
  const uniqueButtonTypes = getUniqueButtonTypes()
  
  const totalClicksThisMinute = clicksPerMinuteByTypeData.length > 0 ? 
    Object.entries(clicksPerMinuteByTypeData[clicksPerMinuteByTypeData.length - 1])
      .filter(([key]) => key !== 'minute' && key !== 'timestamp')
      .reduce((sum, [, value]) => sum + (value as number), 0) : 0

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
            <span>Current Minute CPM: <span className="text-blue-400 font-semibold">{totalClicksThisMinute}</span></span>
            <span>Button Types: <span className="text-purple-400 font-semibold">{uniqueButtonTypes.length}</span></span>
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
                  Clicks per minute by button type - {clickHistory.length} total clicks across {clicksPerMinuteByTypeData.length} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* shadcn Line Chart - Clicks Per Minute By Type */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Clicks Per Minute by Button Type</h3>
                  <ChartContainer config={chartConfig}>
                    <LineChart
                      accessibilityLayer
                      data={clicksPerMinuteByTypeData}
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
                          labelFormatter={(value) => `Time: ${value}`}
                        />}
                      />
                      {/* Render a line for each button type */}
                      {uniqueButtonTypes.map((buttonType) => {
                        const configKey = buttonType.replace(/\s+/g, '').toLowerCase() as keyof typeof chartConfig
                        const color = chartConfig[configKey]?.color || '#60a5fa'
                        return (
                          <Line
                            key={buttonType}
                            dataKey={buttonType}
                            type="monotone"
                            stroke={color}
                            strokeWidth={2}
                            dot={{
                              fill: color,
                              strokeWidth: 2,
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                              fill: color,
                              stroke: color,
                              strokeWidth: 2,
                            }}
                            name={chartConfig[configKey]?.label || buttonType}
                            connectNulls={false}
                          />
                        )
                      })}
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
                    <p className="text-2xl font-bold text-green-400">{uniqueButtonTypes.length}</p>
                    <p className="text-sm text-muted-foreground">Button Types Used</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{clicksPerMinuteByTypeData.length}</p>
                    <p className="text-sm text-muted-foreground">Active Minutes</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-orange-400">
                      {clicksPerMinuteByTypeData.length > 0 ? 
                        Math.max(...clicksPerMinuteByTypeData.map(data => 
                          Object.entries(data)
                            .filter(([key]) => key !== 'minute' && key !== 'timestamp')
                            .reduce((sum, [, value]) => sum + (value as number), 0)
                        )) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Peak CPM</p>
                  </div>
                </div>

                {/* Legend for Line Colors */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-muted-foreground w-full mb-2">Button Type Colors:</p>
                  {uniqueButtonTypes.map((buttonType) => {
                    const configKey = buttonType.replace(/\s+/g, '').toLowerCase() as keyof typeof chartConfig
                    const color = chartConfig[configKey]?.color || '#60a5fa'
                    const label = chartConfig[configKey]?.label || buttonType
                    return (
                      <div key={buttonType} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    )
                  })}
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