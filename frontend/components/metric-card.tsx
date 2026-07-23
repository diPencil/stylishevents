import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  comparison?: string
  className?: string
}

export function MetricCard({ title, value, unit, comparison, className }: MetricCardProps) {
  return (
    <Card className={`border shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-3xl font-bold">
            {value} {unit && <span className="text-base font-normal text-muted-foreground">{unit}</span>}
          </div>
          {comparison && <div className="text-xs text-muted-foreground mt-1">{comparison}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
