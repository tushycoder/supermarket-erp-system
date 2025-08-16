import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Calendar, Building, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function InvoiceList() {
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  const invoiceList = invoices || [];

  if (invoiceList.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
        <p className="text-gray-600 mb-4">
          Upload your first invoice to get started with AI processing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total {invoiceList.length} invoice{invoiceList.length !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" onClick={() => refetch()} data-testid="refresh-invoices">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoiceList.map((invoice: any, index: number) => (
          <Card key={invoice.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`invoice-card-${index}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="text-blue-600" size={20} />
                  <CardTitle className="text-base" data-testid={`invoice-title-${index}`}>
                    {invoice.invoiceNumber || `Invoice #${invoice.id.slice(0, 8)}`}
                  </CardTitle>
                </div>
                <Badge className={getStatusColor(invoice.status)} data-testid={`invoice-status-${index}`}>
                  {getStatusIcon(invoice.status)} {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Supplier Info */}
              {invoice.supplierName && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building size={14} />
                  <span data-testid={`supplier-name-${index}`}>{invoice.supplierName}</span>
                </div>
              )}

              {/* Invoice Date */}
              {invoice.invoiceDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span data-testid={`invoice-date-${index}`}>
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}

              {/* Total Amount */}
              {invoice.totalAmount && (
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                  <IndianRupee size={14} />
                  <span data-testid={`total-amount-${index}`}>
                    {parseFloat(invoice.totalAmount).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Processing Results */}
              {invoice.status === 'processed' && invoice.extractedData && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">AI Extraction Results:</p>
                  <div className="space-y-1 text-xs text-green-700">
                    <div>Items: {invoice.extractedData.items?.length || 0} products</div>
                    <div>Subtotal: ₹{invoice.extractedData.subtotal?.toLocaleString() || '0'}</div>
                    <div>Tax: ₹{invoice.extractedData.taxAmount?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              )}

              {/* Processing Error */}
              {invoice.status === 'failed' && invoice.processingError && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-1">Processing Failed:</p>
                  <p className="text-xs text-red-700" data-testid={`processing-error-${index}`}>
                    {invoice.processingError}
                  </p>
                </div>
              )}

              {/* Processing in progress */}
              {invoice.status === 'processing' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-blue-800">Processing with AI...</p>
                  </div>
                </div>
              )}

              {/* Upload Date */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(invoice.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center justify-center space-x-1"
                  data-testid={`view-invoice-${index}`}
                >
                  <Eye size={14} />
                  <span>View</span>
                </Button>
                {invoice.status === 'processed' && (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex items-center justify-center space-x-1"
                    data-testid={`download-data-${index}`}
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
