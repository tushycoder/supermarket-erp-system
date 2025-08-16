import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, Users, Clock, IndianRupee } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function StatsCards() {
  const { stats, isLoading } = useDashboardData();

  const cards = [
    {
      title: "Today's Sales",
      value: stats ? `₹${stats.todaySales.toLocaleString()}` : "₹0",
      change: "+12.5% from yesterday",
      changeType: "positive" as const,
      icon: IndianRupee,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      testId: "stats-today-sales"
    },
    {
      title: "Total Products",
      value: stats?.totalProducts?.toLocaleString() || "0",
      change: stats?.lowStockCount ? `${stats.lowStockCount} low stock items` : "All stock levels good",
      changeType: stats?.lowStockCount ? "warning" as const : "neutral" as const,
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      testId: "stats-total-products"
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers?.toLocaleString() || "0",
      change: "+8 new this week",
      changeType: "positive" as const,
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      testId: "stats-active-customers"
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders?.toLocaleString() || "0",
      change: "2 urgent deliveries",
      changeType: "neutral" as const,
      icon: Clock,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      testId: "stats-pending-orders"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-sm border border-gray-200" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid={`${card.testId}-value`}>
                    {card.value}
                  </p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 
                    card.changeType === 'warning' ? 'text-orange-600' : 
                    'text-gray-500'
                  }`}>
                    {card.changeType === 'positive' && <TrendingUp className="inline w-4 h-4 mr-1" />}
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
