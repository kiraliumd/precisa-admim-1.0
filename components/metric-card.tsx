import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "accent"
}

export function MetricCard({ title, value, icon: Icon, description, trend, variant = "default" }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div
          className={`rounded-lg p-2 ${
            variant === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">{value}</div>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-medium ${trend.isPositive ? "text-primary" : "text-red-500"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
