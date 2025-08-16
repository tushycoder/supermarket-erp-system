import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSupplierSchema } from "@shared/schema";
import { z } from "zod";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = z.infer<typeof insertSupplierSchema>;

export function AddSupplierDialog({ open, onOpenChange }: AddSupplierDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      panNumber: "",
      paymentTerms: "",
      isActive: true
    }
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Supplier created",
        description: "Supplier has been added successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create supplier",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSupplierMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-supplier-dialog">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter supplier name"
                data-testid="supplier-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...register("contactPerson")}
                placeholder="Enter contact person name"
                data-testid="contact-person-input"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
                data-testid="supplier-phone-input"
              />
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                data-testid="supplier-email-input"
              />
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                {...register("gstNumber")}
                placeholder="Enter GST number"
                data-testid="gst-number-input"
              />
            </div>

            {/* PAN Number */}
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                {...register("panNumber")}
                placeholder="Enter PAN number"
                data-testid="pan-number-input"
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                {...register("paymentTerms")}
                placeholder="e.g., Net 30 days, Cash on Delivery"
                data-testid="payment-terms-input"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter supplier address"
              rows={3}
              data-testid="supplier-address-input"
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
              disabled={createSupplierMutation.isPending}
              data-testid="save-supplier-button"
            >
              {createSupplierMutation.isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
