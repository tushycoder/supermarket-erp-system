import { Sidebar } from "@/components/sidebar";
import { SalesAnalytics } from "@/components/analytics/sales-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useState } from "react";

export default function Analytics() {
  const { stats, topProducts } = useDashboardData();
  const [period, setPeriod] = useState("30");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-primary" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
                <p className="text-gray-500">Comprehensive insights and performance metrics</p>
              </div>
            </div>
            <Select value={period} onValueChange={setPeriod} data-testid="analytics-period-select">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-200" data-testid="metric-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{stats?.todaySales?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-green-600">+15.3% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200" data-testid="metric-products">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Products Sold</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                    <p className="text-sm text-blue-600">+8.7% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200" data-testid="metric-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.activeCustomers?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-purple-600">+12.1% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200" data-testid="metric-growth">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">23.8%</p>
                    <p className="text-sm text-green-600">Monthly growth</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Analytics Chart */}
            <SalesAnalytics period={period} />

            {/* Top Products */}
            <Card className="shadow-sm border border-gray-200" data-testid="top-products-chart">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product: any, index: number) => (
                      <div key={product.id} className="flex items-center justify-between" data-testid={`top-product-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{product.totalQuantity} sold</p>
                          <p className="text-sm text-gray-600">₹{product.totalRevenue?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No sales data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border border-gray-200" data-testid="inventory-status">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-semibold">{stats?.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-semibold text-orange-600">{stats?.lowStockCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Out of Stock</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200" data-testid="order-status">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-orange-600">{stats?.pendingOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200" data-testid="customer-insights">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Customers</span>
                    <span className="font-semibold text-green-600">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returning</span>
                    <span className="font-semibold text-blue-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Order Value</span>
                    <span className="font-semibold">₹1,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
