import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  notes: z.string().optional(),
});

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function PurchaseOrderForm() {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: "",
      expectedDeliveryDate: "",
      notes: "",
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/purchase-orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Purchase order created",
        description: "Purchase order has been successfully created.",
      });
      form.reset();
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create purchase order.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!currentItem.productId) {
      toast({
        title: "Error",
        description: "Please select a product.",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    const totalPrice = currentItem.quantity * currentItem.unitPrice;
    const newItem: PurchaseOrderItem = {
      ...currentItem,
      productName: product.name,
      totalPrice,
    };

    setItems(prev => [...prev, newItem]);
    setCurrentItem({
      productId: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const onSubmit = (data: any) => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the purchase order.",
        variant: "destructive",
      });
      return;
    }

    const purchaseOrderData = {
      ...data,
      items,
      totalAmount: calculateTotal().toFixed(2),
      status: "pending",
    };

    createPurchaseOrderMutation.mutate(purchaseOrderData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier</Label>
                <Select 
                  value={form.watch("supplierId")} 
                  onValueChange={(value) => form.setValue("supplierId", value)}
                >
                  <SelectTrigger data-testid="select-supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  {...form.register("expectedDeliveryDate")}
                  data-testid="input-delivery-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes or instructions"
                {...form.register("notes")}
                data-testid="input-notes"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select 
                value={currentItem.productId} 
                onValueChange={(value) => {
                  const product = products.find(p => p.id === value);
                  setCurrentItem(prev => ({
                    ...prev,
                    productId: value,
                    unitPrice: product ? parseFloat(product.costPrice) : 0,
                  }));
                }}
              >
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 1 
                }))}
                data-testid="input-quantity"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={currentItem.unitPrice}
                onChange={(e) => setCurrentItem(prev => ({ 
                  ...prev, 
                  unitPrice: parseFloat(e.target.value) || 0 
                }))}
                data-testid="input-unit-price"
              />
            </div>

            <Button type="button" onClick={addItem} data-testid="button-add-item">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ₹{item.unitPrice.toFixed(2)} = ₹{item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    data-testid={`button-remove-item-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="border-t pt-2 text-right">
                <p className="text-lg font-bold">
                  Total: ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={createPurchaseOrderMutation.isPending}
        onClick={form.handleSubmit(onSubmit)}
        data-testid="button-create-order"
      >
        {createPurchaseOrderMutation.isPending ? "Creating..." : "Create Purchase Order"}
      </Button>
    </div>
  );
}