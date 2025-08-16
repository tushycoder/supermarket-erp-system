import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail, MapPin, FileText, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SupplierListProps {
  searchQuery: string;
}

export function SupplierList({ searchQuery }: SupplierListProps) {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filteredSuppliers = (suppliers || []).filter((supplier: any) =>
    searchQuery === "" || 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.includes(searchQuery) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No suppliers found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `No suppliers match "${searchQuery}"`
            : "Start by adding your first supplier"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier: any, index: number) => (
          <Card key={supplier.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`supplier-card-${index}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Supplier Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1" data-testid={`supplier-name-${index}`}>
                      {supplier.name}
                    </h3>
                    {supplier.contactPerson && (
                      <p className="text-sm text-gray-600 mt-1" data-testid={`contact-person-${index}`}>
                        Contact: {supplier.contactPerson}
                      </p>
                    )}
                  </div>
                  <Badge variant={supplier.isActive ? "default" : "secondary"} data-testid={`supplier-status-${index}`}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  {supplier.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span data-testid={`supplier-phone-${index}`}>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span data-testid={`supplier-email-${index}`}>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2" data-testid={`supplier-address-${index}`}>
                        {supplier.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Business Details */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {supplier.gstNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST:</span>
                      <span className="font-mono text-xs" data-testid={`gst-number-${index}`}>
                        {supplier.gstNumber}
                      </span>
                    </div>
                  )}
                  {supplier.panNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">PAN:</span>
                      <span className="font-mono text-xs" data-testid={`pan-number-${index}`}>
                        {supplier.panNumber}
                      </span>
                    </div>
                  )}
                  {supplier.paymentTerms && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Terms:</span>
                      <span data-testid={`payment-terms-${index}`}>
                        {supplier.paymentTerms}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Added:</span>
                    <span data-testid={`supplier-created-${index}`}>
                      {new Date(supplier.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-1"
                    data-testid={`edit-supplier-${index}`}
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex items-center justify-center space-x-1"
                    data-testid={`view-orders-${index}`}
                  >
                    <FileText size={14} />
                    <span>Orders</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
