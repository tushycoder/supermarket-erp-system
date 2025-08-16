import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CustomerListProps {
  searchQuery: string;
}

export function CustomerList({ searchQuery }: CustomerListProps) {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
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

  const filteredCustomers = (customers || []).filter((customer: any) =>
    searchQuery === "" || 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredCustomers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `No customers match "${searchQuery}"`
            : "Start by adding your first customer"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer: any, index: number) => (
          <Card key={customer.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`customer-card-${index}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Customer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1" data-testid={`customer-name-${index}`}>
                      {customer.name}
                    </h3>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium" data-testid={`loyalty-points-${index}`}>
                          {customer.loyaltyPoints || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={customer.isActive ? "default" : "secondary"} data-testid={`customer-status-${index}`}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  {customer.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span data-testid={`customer-phone-${index}`}>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span data-testid={`customer-email-${index}`}>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2" data-testid={`customer-address-${index}`}>
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Purchase Stats */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Purchases:</span>
                    <span className="font-medium" data-testid={`total-purchases-${index}`}>
                      ₹{parseFloat(customer.totalPurchases || "0").toLocaleString()}
                    </span>
                  </div>
                  {customer.lastVisit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Visit:</span>
                      <span data-testid={`last-visit-${index}`}>
                        {new Date(customer.lastVisit).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since:</span>
                    <span data-testid={`member-since-${index}`}>
                      {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-1"
                    data-testid={`edit-customer-${index}`}
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    data-testid={`view-history-${index}`}
                  >
                    View History
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

import { Users } from "lucide-react";
