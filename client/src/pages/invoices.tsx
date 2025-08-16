import { Sidebar } from "@/components/sidebar";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { Button } from "@/components/ui/button";
import { Upload, Receipt } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Invoices() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      await apiRequest('POST', '/api/invoices/upload', formData);
      
      toast({
        title: "Invoice uploaded successfully",
        description: "AI processing has started. You'll see results shortly.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="text-primary" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invoice Processing</h2>
                <p className="text-gray-500">AI-powered invoice processing and data extraction</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="invoice-file-input"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
                data-testid="upload-invoice-button"
              >
                <Upload size={16} />
                <span>Upload Invoice</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <InvoiceList />
        </main>
      </div>
    </div>
  );
}
