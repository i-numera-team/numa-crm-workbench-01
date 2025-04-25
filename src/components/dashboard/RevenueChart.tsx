
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  {
    month: "Jan",
    revenue: 10400,
  },
  {
    month: "Feb",
    revenue: 14800,
  },
  {
    month: "Mar", 
    revenue: 9600,
  },
  {
    month: "Apr",
    revenue: 12200,
  },
  {
    month: "May",
    revenue: 17800,
  },
  {
    month: "Jun",
    revenue: 15200,
  },
  {
    month: "Jul",
    revenue: 19000,
  }
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={(value) => `€${value}`}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickMargin={10}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border shadow-sm">
                  <div className="text-sm font-bold">{`€${payload[0].value}`}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          fill="rgba(37, 99, 235, 0.2)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
