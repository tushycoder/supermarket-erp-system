import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSearch } from "./product-search";
import { CartSummary } from "./cart-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useState } from "react";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useQuery } from "@tanstack/react-query";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
}

export function POSTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { isScanning, startScan, stopScan } = useBarcodeScanner((barcode) => {
    // Handle barcode scan result
    handleBarcodeScanned(barcode);
  });

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      if (response.ok) {
        const product = await response.json();
        addToCart(product);
      }
    } catch (error) {
      console.error("Error finding product by barcode:", error);
    }
  };

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: parseFloat(product.sellingPrice),
          quantity: 1,
          unit: product.unit
        }];
      }
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerId("");
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const totals = calculateTotal();
      const saleData = {
        customerId: customerId || null,
        userId: "current-user-id", // This should come from auth context
        subtotal: totals.subtotal,
        taxAmount: totals.tax,
        discountAmount: 0,
        totalAmount: totals.total,
        paymentMethod,
        status: "completed",
        notes: ""
      };

      const itemsData = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }));

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sale: saleData, items: itemsData }),
      });

      if (response.ok) {
        const sale = await response.json();
        // Print receipt or show success message
        clearCart();
        alert(`Sale completed! Receipt: ${sale.receiptNumber}`);
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      alert("Failed to process sale. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Panel - Product Search */}
      <div className="lg:col-span-2 space-y-6">
        {/* Barcode Scanner */}
        <Card data-testid="barcode-scanner">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scan className="text-primary" size={20} />
              <span>Barcode Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Scan or enter barcode..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeScanned(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                data-testid="barcode-input"
              />
              <Button
                variant={isScanning ? "destructive" : "default"}
                onClick={isScanning ? stopScan : startScan}
                data-testid="scan-toggle-button"
              >
                {isScanning ? "Stop Scan" : "Start Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Search */}
        <ProductSearch onProductSelect={addToCart} />

        {/* Cart Items */}
        <Card data-testid="cart-items">
          <CardHeader>
            <CardTitle>Cart Items ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`cart-item-${index}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">₹{item.price} / {item.unit}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        data-testid={`decrease-quantity-${index}`}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center" data-testid={`item-quantity-${index}`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        data-testid={`increase-quantity-${index}`}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`remove-item-${index}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No items in cart</p>
                <p className="text-sm text-gray-400">Scan a barcode or search for products to add items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Cart Summary & Checkout */}
      <div className="space-y-6">
        {/* Customer Selection */}
        <Card data-testid="customer-selection">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              data-testid="customer-select"
            >
              <option value="">Walk-in Customer</option>
              {customers?.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Cart Summary */}
        <CartSummary 
          cart={cart}
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
        />

        {/* Payment Method */}
        <Card data-testid="payment-method">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
                className="flex flex-col items-center p-4"
                data-testid="payment-cash"
              >
                <Banknote size={20} />
                <span className="text-sm">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="flex flex-col items-center p-4"
                data-testid="payment-card"
              >
                <CreditCard size={20} />
                <span className="text-sm">Card</span>
              </Button>
              <Button
                variant={paymentMethod === "digital" ? "default" : "outline"}
                onClick={() => setPaymentMethod("digital")}
                className="flex flex-col items-center p-4"
                data-testid="payment-digital"
              >
                <Smartphone size={20} />
                <span className="text-sm">Digital</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Actions */}
        <div className="space-y-3">
          <Button
            onClick={processSale}
            disabled={cart.length === 0 || isProcessing}
            className="w-full h-12 text-lg font-semibold"
            data-testid="checkout-button"
          >
            {isProcessing ? "Processing..." : `Checkout - ₹${totals.total.toFixed(2)}`}
          </Button>
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full"
            data-testid="clear-cart-button"
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
