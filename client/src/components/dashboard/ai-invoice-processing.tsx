import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function AIInvoiceProcessing() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('invoice', file);

      await apiRequest('POST', '/api/invoices/upload', formData);
      
      toast({
        title: "Invoice uploaded successfully",
        description: "AI processing has started. You'll see results shortly.",
      });

      // Refresh the invoices list
      refetch();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        return <CheckCircle size={16} className="text-green-600" />;
      case 'processing':
        return <Loader size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <FileText size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const recentInvoices = invoices?.slice(0, 3) || [];

  return (
    <Card className="shadow-sm border border-gray-200 mb-8" data-testid="ai-invoice-processing">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">AI Invoice Processing</CardTitle>
            <p className="text-gray-600 text-sm">Upload supplier invoices for automatic data extraction</p>
          </div>
          <Badge className="bg-green-100 text-green-800">AI Powered</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            data-testid="invoice-upload-area"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="invoice-file-input"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Drop invoice files here</p>
            <p className="text-sm text-gray-600 mb-4">or click to browse</p>
            <p className="text-xs text-gray-500">Supports PDF, JPG, PNG up to 10MB</p>
            <Button 
              className="mt-4" 
              disabled={isUploading}
              data-testid="choose-files-button"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Choose Files"
              )}
            </Button>
          </div>

          {/* Processing Status */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentInvoices.length > 0 ? (
              recentInvoices.map((invoice: any, index: number) => (
                <div 
                  key={invoice.id} 
                  className="p-4 border rounded-lg"
                  data-testid={`invoice-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(invoice.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {invoice.invoiceNumber || `Invoice ${invoice.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.status === 'processed' && invoice.extractedData 
                          ? `✓ Data extracted: ${invoice.extractedData.items?.length || 0} products, ₹${invoice.totalAmount || 0}`
                          : invoice.status === 'processing'
                          ? "Processing with OCR..."
                          : invoice.status === 'failed'
                          ? "Processing failed"
                          : "Uploaded"
                        }
                      </p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No invoices uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first invoice to see AI processing in action</p>
              </div>
            )}

            {recentInvoices.length > 0 && recentInvoices.some((inv: any) => inv.status === 'processed') && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">AI Extraction Results:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Supplier: {recentInvoices.find((inv: any) => inv.status === 'processed')?.supplierName || 'Auto-detected'}</li>
                  <li>• Invoice Date: {recentInvoices.find((inv: any) => inv.status === 'processed')?.invoiceDate || 'Auto-detected'}</li>
                  <li>• Total Amount: ₹{recentInvoices.find((inv: any) => inv.status === 'processed')?.totalAmount || '0'}</li>
                  <li>• Products: {recentInvoices.find((inv: any) => inv.status === 'processed')?.extractedData?.items?.length || 0} items identified</li>
                  <li>• Tax Rate: 18% GST</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
