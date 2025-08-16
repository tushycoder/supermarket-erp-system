import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ProductListProps {
  searchQuery: string;
}

export function ProductList({ searchQuery }: ProductListProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: searchQuery ? ["/api/products/search", { q: searchQuery }] : ["/api/products"],
  });

  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const getStockStatus = (currentStock: number, minStockLevel: number) => {
    if (currentStock === 0) {
      return { label: "Out of Stock", color: "destructive" as const };
    } else if (currentStock <= minStockLevel) {
      return { label: "Low Stock", color: "destructive" as const };
    } else if (currentStock <= minStockLevel * 1.5) {
      return { label: "Warning", color: "secondary" as const };
    } else {
      return { label: "In Stock", color: "default" as const };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filteredProducts = products || [];

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `No products match "${searchQuery}"`
            : "Start by adding your first product to inventory"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product: any, index: number) => {
          const stockStatus = getStockStatus(product.currentStock, product.minStockLevel);
          
          return (
            <Card key={product.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`product-card-${index}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Product Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2" data-testid={`product-name-${index}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1" data-testid={`product-sku-${index}`}>
                        SKU: {product.sku}
                      </p>
                      <p className="text-sm text-gray-600" data-testid={`product-category-${index}`}>
                        {product.category}
                      </p>
                    </div>
                    {product.currentStock <= product.minStockLevel && (
                      <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant={stockStatus.color} data-testid={`stock-status-${index}`}>
                      {stockStatus.label}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900" data-testid={`stock-quantity-${index}`}>
                      {product.currentStock} {product.unit}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="font-medium" data-testid={`cost-price-${index}`}>₹{parseFloat(product.costPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="text-lg font-bold text-primary" data-testid={`selling-price-${index}`}>
                        ₹{parseFloat(product.sellingPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Expiry Date (if applicable) */}
                  {product.expiryDate && (
                    <div className="text-sm text-gray-600">
                      <span>Expires: </span>
                      <span data-testid={`expiry-date-${index}`}>
                        {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center justify-center space-x-1"
                      onClick={() => setEditingProduct(product.id)}
                      data-testid={`edit-product-${index}`}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center justify-center"
                      data-testid={`delete-product-${index}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
