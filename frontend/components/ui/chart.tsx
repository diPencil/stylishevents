"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { ChartConfig } from "@/types"

interface ChartContextValue {
  config: ChartConfig
  colors: Record<string, string>
}

const ChartContext = React.createContext<ChartContextValue | undefined>(undefined)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a ChartProvider")
  }

  return context
}

interface ChartContainerProps {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}

function ChartContainer({ config, className, children }: ChartContainerProps) {
  const colors = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        `--color-${key}`,
        (value as { color: string }).color,
      ])
    )
  }, [config])

  return (
    <ChartContext.Provider value={{ config, colors }}>
      <div className={className} style={colors as React.CSSProperties}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
  }>
  label?: string
}

function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((item) => {
          const color = config[item.dataKey]?.color
          const formattedValue = Intl.NumberFormat("en-US").format(item.value)

          return (
            <div key={item.dataKey} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {config[item.dataKey]?.label ?? item.name}:
                </span>
              </div>
              <span className="text-xs font-medium">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
