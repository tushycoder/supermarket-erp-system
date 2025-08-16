import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, UserPlus } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function RecentActivity() {
  const { recentActivity, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart size={16} className="text-green-600" />;
      case 'stock':
        return <Package size={16} className="text-blue-600" />;
      case 'customer':
        return <UserPlus size={16} className="text-purple-600" />;
      default:
        return <ShoppingCart size={16} className="text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100';
      case 'stock':
        return 'bg-blue-100';
      case 'customer':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200" data-testid="recent-activity">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
            recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg" data-testid={`activity-${index}`}>
                <div className={`w-8 h-8 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
        <Button variant="ghost" className="mt-4 text-primary hover:text-blue-700" data-testid="view-all-activity">
          View all activity
        </Button>
      </CardContent>
    </Card>
  );
}
