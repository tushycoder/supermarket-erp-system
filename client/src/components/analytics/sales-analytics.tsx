import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface SalesAnalyticsProps {
  period: string;
}

export function SalesAnalytics({ period }: SalesAnalyticsProps) {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/sales-analytics", { days: parseInt(period) }],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = salesData || [];

  return (
    <Card className="shadow-sm border border-gray-200" data-testid="sales-analytics-chart">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Sales Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={[
                    (value) => [`₹${Number(value).toLocaleString()}`, 'Revenue'],
                    (value, name, props) => [props.payload.totalSales, 'Sales Count']
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stroke="hsl(217.2 91.2% 59.8%)" 
                  strokeWidth={3} 
                  dot={{ fill: 'hsl(217.2 91.2% 59.8%)', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: 'hsl(217.2 91.2% 59.8%)', strokeWidth: 2, fill: 'white' }}
                />
                <Bar
                  dataKey="totalSales"
                  fill="hsl(159.7826 100% 36.0784%)"
                  opacity={0.6}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LineChart className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-600 font-medium">Sales Analytics Chart</p>
              <p className="text-sm text-gray-500 mt-2">No sales data available for the selected period</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


