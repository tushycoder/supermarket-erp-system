import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { AIInvoiceProcessing } from "@/components/dashboard/ai-invoice-processing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus, ShoppingCart, Receipt, Bot } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { isLoading } = useDashboardData();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-500">Welcome back! Here's what's happening at your store today.</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products, customers..."
                  className="w-64 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </span>
                </Button>
              </div>

              {/* Quick Actions */}
              <Link href="/pos">
                <Button className="flex items-center space-x-2" data-testid="new-sale-button">
                  <Plus size={16} />
                  <span>New Sale</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <StatsCards />

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2">
                  <SalesChart />
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/pos">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100"
                        data-testid="quick-action-new-sale"
                      >
                        <ShoppingCart size={20} className="text-primary" />
                        <span className="font-medium">Start New Sale</span>
                      </Button>
                    </Link>
                    <Link href="/inventory">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100"
                        data-testid="quick-action-add-product"
                      >
                        <Plus size={20} className="text-secondary" />
                        <span className="font-medium">Add Product</span>
                      </Button>
                    </Link>
                    <Link href="/invoices">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100"
                        data-testid="quick-action-process-invoice"
                      >
                        <Receipt size={20} className="text-warning" />
                        <span className="font-medium">Process Invoice</span>
                      </Button>
                    </Link>
                    <Link href="/advanced-analytics">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100"
                        data-testid="quick-action-ai-analysis"
                      >
                        <Bot size={20} className="text-purple-600" />
                        <span className="font-medium">AI Analysis</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Low Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RecentActivity />
                <LowStockAlerts />
              </div>

              {/* AI Invoice Processing */}
              <AIInvoiceProcessing />
            </>
          )}
        </main>
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/advanced-analytics">
          <Button 
            size="lg" 
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl rounded-full"
            data-testid="ai-assistant-button"
          >
            <Bot size={24} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
