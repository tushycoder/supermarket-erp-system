import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
}

interface CartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export function CartSummary({ cart, subtotal, tax, total }: CartSummaryProps) {
  return (
    <Card data-testid="cart-summary">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="text-primary" size={20} />
          <span>Cart Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium" data-testid="cart-item-count">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium" data-testid="cart-subtotal">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (18% GST):</span>
            <span className="font-medium" data-testid="cart-tax">₹{tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-primary" data-testid="cart-total">₹{total.toFixed(2)}</span>
        </div>

        {/* Quick Stats */}
        {cart.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Quick Stats:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Avg. Item Price:</span>
                <p className="font-medium">₹{(subtotal / cart.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Tax Rate:</span>
                <p className="font-medium">18%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
