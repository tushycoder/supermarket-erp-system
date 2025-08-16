import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useState } from "react";

export function SalesChart() {
  const { salesAnalytics, isLoading } = useDashboardData();
  const [period, setPeriod] = useState("7");
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    // TODO: Refetch data with new period
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = salesAnalytics || [];

  return (
    <Card className="shadow-sm border border-gray-200" data-testid="sales-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Sales Overview</CardTitle>
          <Select value={period} onValueChange={handlePeriodChange} data-testid="sales-chart-period-select">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={[(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Sales Chart Visualization</p>
              <p className="text-sm text-gray-500 mt-2">No sales data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


