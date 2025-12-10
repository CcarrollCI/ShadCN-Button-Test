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

const chartConfig = {
  totalClicks: {
    label: "Total Clicks",
    color: "hsl(var(--chart-1))",
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

  // Get all clicks data for shadcn line chart
  const getAllClicksData = () => {
    return clickHistory.map((click, index) => ({
      ...click,
      clickNumber: index + 1,
      // Format time for better display on x-axis
      displayTime: clickHistory.length > 50 ? 
        (index % Math.ceil(clickHistory.length / 20) === 0 ? click.time : '') : 
        click.time
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
        <div className="w-full max-w-7xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Click Analytics Dashboard</CardTitle>
              <CardDescription>
                Visual representation of your button clicking activity - All {clickHistory.length} clicks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* shadcn Line Chart - All Clicks Over Time */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Clicks Over Time ({clickHistory.length} total)</h3>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={getAllClicksData()}
                    margin={{
                      top: 20,
                      left: 12,
                      right: 12,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="displayTime"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent 
                        hideLabel={false}
                        labelFormatter={(value, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload
                            return `Time: ${data.time} | Button: ${data.buttonType}`
                          }
                          return value
                        }}
                      />}
                    />
                    <Line
                      dataKey="totalClicks"
                      type="monotone"
                      stroke="var(--color-totalClicks)"
                      strokeWidth={2}
                      dot={{
                        fill: "var(--color-totalClicks)",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
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
                      fill="hsl(var(--chart-2))" 
                      name="Click Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{clickHistory.length}</p>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(clickHistory.map(click => click.buttonType)).size}
                  </p>
                  <p className="text-sm text-gray-600">Different Buttons</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {clickHistory.length > 0 ? 
                      (clickHistory.filter(click => click.buttonType === "Auto Clicker").length / clickHistory.length * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Auto Clicks</p>
                </div>
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