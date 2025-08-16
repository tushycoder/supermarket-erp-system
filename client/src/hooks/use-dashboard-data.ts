import { useQuery } from "@tanstack/react-query";

export function useDashboardData() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: salesAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/dashboard/sales-analytics"],
  });

  const isLoading = statsLoading || topProductsLoading || activityLoading || analyticsLoading;

  return {
    stats,
    topProducts,
    recentActivity,
    salesAnalytics,
    isLoading,
  };
}
