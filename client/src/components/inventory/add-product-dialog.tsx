import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertProductSchema.extend({
  costPrice: z.string().min(1, "Cost price is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
});

type FormData = z.infer<typeof formSchema>;

const categories = [
  "Groceries",
  "Beverages", 
  "Snacks",
  "Personal Care",
  "Household",
  "Dairy",
  "Frozen Foods",
  "Electronics",
  "Other"
];

const units = [
  "pcs",
  "kg", 
  "gm",
  "liters",
  "ml",
  "packets",
  "boxes"
];

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      category: "Groceries",
      description: "",
      costPrice: "",
      sellingPrice: "",
      currentStock: 0,
      minStockLevel: 5,
      maxStockLevel: 100,
      unit: "pcs",
      expiryDate: undefined,
      isActive: true
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const productData = {
        ...data,
        costPrice: parseFloat(data.costPrice),
        sellingPrice: parseFloat(data.sellingPrice),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
      };
      return apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Product has been added to inventory successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createProductMutation.mutate(data);
  };

  const generateSKU = () => {
    const sku = `PRD-${Date.now().toString().slice(-6)}`;
    setValue("sku", sku);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-product-dialog">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter product name"
                data-testid="product-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <div className="flex space-x-2">
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="Product SKU"
                  data-testid="product-sku-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSKU}
                  data-testid="generate-sku-button"
                >
                  Generate
                </Button>
              </div>
              {errors.sku && (
                <p className="text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                {...register("barcode")}
                placeholder="Product barcode"
                data-testid="product-barcode-input"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue="Groceries">
                <SelectTrigger data-testid="product-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register("costPrice")}
                placeholder="0.00"
                data-testid="product-cost-price-input"
              />
              {errors.costPrice && (
                <p className="text-sm text-red-600">{errors.costPrice.message}</p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                {...register("sellingPrice")}
                placeholder="0.00"
                data-testid="product-selling-price-input"
              />
              {errors.sellingPrice && (
                <p className="text-sm text-red-600">{errors.sellingPrice.message}</p>
              )}
            </div>

            {/* Current Stock */}
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                {...register("currentStock", { valueAsNumber: true })}
                placeholder="0"
                data-testid="product-current-stock-input"
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={(value) => setValue("unit", value)} defaultValue="pcs">
                <SelectTrigger data-testid="product-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                {...register("minStockLevel", { valueAsNumber: true })}
                placeholder="5"
                data-testid="product-min-stock-input"
              />
            </div>

            {/* Max Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input
                id="maxStockLevel"
                type="number"
                {...register("maxStockLevel", { valueAsNumber: true })}
                placeholder="100"
                data-testid="product-max-stock-input"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate")}
                data-testid="product-expiry-date-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Product description (optional)"
              rows={3}
              data-testid="product-description-input"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              data-testid="save-product-button"
            >
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
