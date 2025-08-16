import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function LowStockAlerts() {
  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = lowStockProducts || [];

  const getAlertColor = (currentStock: number, minStockLevel: number) => {
    if (currentStock === 0) return { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", button: "bg-red-600 hover:bg-red-700" };
    if (currentStock <= minStockLevel * 0.5) return { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", button: "bg-red-600 hover:bg-red-700" };
    if (currentStock <= minStockLevel) return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", button: "bg-orange-600 hover:bg-orange-700" };
    return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-600", button: "bg-yellow-600 hover:bg-yellow-700" };
  };

  return (
    <Card className="shadow-sm border border-gray-200" data-testid="low-stock-alerts">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Low Stock Alerts</CardTitle>
          <Badge variant="destructive" data-testid="low-stock-count">
            {products.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length > 0 ? (
            products.slice(0, 5).map((product: any, index: number) => {
              const colors = getAlertColor(product.currentStock, product.minStockLevel);
              return (
                <div 
                  key={product.id} 
                  className={`flex items-center justify-between p-3 ${colors.bg} border ${colors.border} rounded-lg`}
                  data-testid={`low-stock-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={colors.text} size={20} />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.currentStock === 0 
                          ? "Out of stock" 
                          : `Only ${product.currentStock} ${product.unit} left`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className={`${colors.button} text-white`}
                    data-testid={`reorder-button-${index}`}
                  >
                    Reorder
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">All products have adequate stock</p>
            </div>
          )}
        </div>
        {products.length > 5 && (
          <Button variant="ghost" className="mt-4 text-primary hover:text-blue-700" data-testid="view-all-alerts">
            View all alerts
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


