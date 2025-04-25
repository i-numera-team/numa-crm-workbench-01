
import { mockDataService } from "@/utils/mockData";
import { Bar, XAxis, YAxis, CartesianGrid, ComposedChart } from 'recharts';
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';

export function RevenueChart() {
  return (
    <ChartContainer
      config={{
        revenue: { label: "Revenu", color: "#9b87f5" },
        month: { label: "Mois", color: "#fff" }
      }}
    >
      <ComposedChart data={mockDataService.getMonthlyRevenue()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#7A82AB" }} />
        <YAxis tick={{ fill: "#7A82AB" }} />
        <Bar dataKey="revenue" fill="#9b87f5" radius={[6, 6, 0, 0]} />
        <ChartTooltipContent labelKey="month" />
        <ChartLegendContent />
      </ComposedChart>
    </ChartContainer>
  );
}
