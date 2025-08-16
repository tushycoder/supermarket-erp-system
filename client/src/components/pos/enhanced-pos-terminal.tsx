import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Scan, 
  CreditCard, 
  Banknote, 
  Plus, 
  Minus, 
  Trash2,
  Calculator,
  User
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  unit: string;
  currentStock: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

export function EnhancedPOSTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const change = parseFloat(cashReceived) - total;

  // Add product by barcode
  const addProductMutation = useMutation({
    mutationFn: async (barcode: string) => {
      return apiRequest("GET", `/api/products/barcode/${barcode}`);
    },
    onSuccess: (product) => {
      if (product.currentStock <= 0) {
        toast({
          title: "Out of stock",
          description: `${product.name} is currently out of stock.`,
          variant: "destructive",
        });
        return;
      }

      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.currentStock) {
          toast({
            title: "Insufficient stock",
            description: `Only ${product.currentStock} ${product.unit} available.`,
            variant: "destructive",
          });
          return;
        }
        updateQuantity(product.id, existingItem.quantity + 1);
      } else {
        setCart(prev => [...prev, {
          id: product.id,
          name: product.name,
          price: parseFloat(product.sellingPrice),
          quantity: 1,
          sku: product.sku,
          unit: product.unit,
          currentStock: product.currentStock,
        }]);
      }
      setBarcodeInput("");
      toast({
        title: "Product added",
        description: `${product.name} added to cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Product not found",
        description: "No product found with this barcode.",
        variant: "destructive",
      });
    },
  });

  // Find customer by phone
  const findCustomerMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("GET", `/api/customers/phone/${phone}`);
    },
    onSuccess: (foundCustomer) => {
      setCustomer(foundCustomer);
      toast({
        title: "Customer found",
        description: `Welcome back, ${foundCustomer.name}!`,
      });
    },
    onError: () => {
      toast({
        title: "Customer not found",
        description: "No customer found with this phone number.",
        variant: "destructive",
      });
    },
  });

  // Process sale
  const processSaleMutation = useMutation({
    mutationFn: async () => {
      const saleData = {
        customerId: customer?.id || null,
        paymentMethod,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: total.toFixed(2),
        cashReceived: paymentMethod === "cash" ? cashReceived : null,
        changeGiven: paymentMethod === "cash" ? Math.max(0, change).toFixed(2) : null,
        loyaltyPointsEarned: Math.floor(total / 10), // 1 point per ₹10 spent
      };

      const saleItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        totalPrice: (item.price * item.quantity).toFixed(2),
      }));

      return apiRequest("POST", "/api/sales", { sale: saleData, items: saleItems });
    },
    onSuccess: (sale) => {
      toast({
        title: "Sale completed successfully",
        description: `Receipt number: ${sale.receiptNumber}`,
      });
      
      // Reset cart and form
      setCart([]);
      setCustomer(null);
      setCashReceived("");
      setPaymentMethod("cash");
      
      // Refresh inventory and dashboard data
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Sale failed",
        description: "Failed to process the sale. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.currentStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.currentStock} ${item.unit} available.`,
        variant: "destructive",
      });
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      addProductMutation.mutate(barcodeInput.trim());
    }
  };

  const canProcessSale = cart.length > 0 && 
    (paymentMethod === "card" || (paymentMethod === "cash" && parseFloat(cashReceived) >= total));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Scanner & Cart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Barcode Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Product Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <Input
                placeholder="Scan or enter barcode/SKU"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                autoFocus
                data-testid="input-barcode"
              />
              <Button type="submit" disabled={addProductMutation.isPending}>
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Customer Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  <Badge variant="secondary">{customer.loyaltyPoints} points</Badge>
                </div>
                <Button variant="outline" onClick={() => setCustomer(null)}>
                  Clear
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const phone = (e.target as any).phone.value;
                if (phone) findCustomerMutation.mutate(phone);
              }} className="flex gap-2">
                <Input
                  name="phone"
                  placeholder="Enter customer phone number"
                  data-testid="input-customer-phone"
                />
                <Button type="submit" disabled={findCustomerMutation.isPending}>
                  Find
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Shopping Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price} per {item.unit}</p>
                      <p className="text-xs text-gray-500">Stock: {item.currentStock}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment & Checkout */}
      <div className="space-y-6">
        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Bill Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18% GST):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
                className="h-12"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="h-12"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card
              </Button>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Cash received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  step="0.01"
                  min="0"
                  data-testid="input-cash-received"
                />
                {parseFloat(cashReceived) >= total && (
                  <p className="text-sm text-green-600">
                    Change: ₹{change.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Sale */}
        <Button
          size="lg"
          className="w-full h-12"
          disabled={!canProcessSale || processSaleMutation.isPending}
          onClick={() => processSaleMutation.mutate()}
          data-testid="button-process-sale"
        >
          {processSaleMutation.isPending ? "Processing..." : `Process Sale - ₹${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}