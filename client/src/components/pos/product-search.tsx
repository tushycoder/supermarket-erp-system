import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProductSearchProps {
  onProductSelect: (product: any) => void;
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: searchQuery ? ["/api/products/search", { q: searchQuery }] : [],
    enabled: searchQuery.length > 2,
  });

  return (
    <Card data-testid="product-search">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="text-primary" size={20} />
          <span>Product Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="product-search-input"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {searchQuery.length > 2 && (
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-1 p-2">
                {products.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => onProductSelect(product)}
                    data-testid={`search-result-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        SKU: {product.sku} | Stock: {product.currentStock} {product.unit}
                      </p>
                      <p className="text-sm font-semibold text-primary">₹{product.sellingPrice}</p>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`add-product-${index}`}>
                      <Plus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No products found for "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        )}

        {searchQuery.length <= 2 && searchQuery.length > 0 && (
          <p className="text-sm text-gray-500">Enter at least 3 characters to search</p>
        )}
      </CardContent>
    </Card>
  );
}
