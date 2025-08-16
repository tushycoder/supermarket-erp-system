import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";

export function ExportManager() {
  const [reportType, setReportType] = useState("");
  const [format, setFormat] = useState("json");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async ({ type, format, params }: any) => {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/reports/${type}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      
      const data = await response.json();
      return { data, type, format };
    },
    onSuccess: ({ data, type, format }) => {
      // Download the report
      downloadReport(data, type, format);
      toast({
        title: "Export successful",
        description: `${type} report exported as ${format.toUpperCase()}`,
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Failed to generate and export the report",
        variant: "destructive",
      });
    },
  });

  const downloadReport = (data: any, type: string, format: string) => {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case "csv":
        content = convertToCSV(data, type);
        mimeType = "text/csv";
        extension = "csv";
        break;
      case "json":
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
        break;
      case "txt":
        content = convertToText(data, type);
        mimeType = "text/plain";
        extension = "txt";
        break;
      default:
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any, type: string): string => {
    switch (type) {
      case "daily-sales":
        if (!data.salesDetails || data.salesDetails.length === 0) {
          return "Date,Total Sales,Total Amount\n" + 
                 `${data.reportDate},${data.totalSales},${data.totalAmount}`;
        }
        return "Date,Sales Count,Total Amount\n" + 
               data.salesDetails.map((item: any) => 
                 `${item.date},${item.totalSales},${item.totalAmount}`
               ).join("\n");
      
      case "inventory":
        if (!data.products) return "No data available";
        return "Name,SKU,Category,Current Stock,Min Stock,Cost Price,Selling Price,Status\n" + 
               data.products.map((product: any) => 
                 `"${product.name}","${product.sku}","${product.category}",${product.currentStock},${product.minStockLevel},${product.costPrice},${product.sellingPrice},"${product.status}"`
               ).join("\n");
      
      case "customers":
        if (!data.customers) return "No data available";
        return "Name,Phone,Email,Loyalty Points,Total Purchases,Last Visit\n" + 
               data.customers.map((customer: any) => 
                 `"${customer.name}","${customer.phone}","${customer.email}",${customer.loyaltyPoints},${customer.totalPurchases},"${customer.lastVisit}"`
               ).join("\n");
      
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const convertToText = (data: any, type: string): string => {
    const title = `${type.toUpperCase().replace('-', ' ')} REPORT`;
    const timestamp = `Generated on: ${new Date().toLocaleString()}`;
    const separator = "=".repeat(50);
    
    let content = `${title}\n${timestamp}\n${separator}\n\n`;
    
    switch (type) {
      case "daily-sales":
        content += `Report Date: ${data.reportDate}\n`;
        content += `Total Sales: ${data.totalSales}\n`;
        content += `Total Amount: ₹${data.totalAmount}\n\n`;
        if (data.salesDetails && data.salesDetails.length > 0) {
          content += "Daily Breakdown:\n";
          data.salesDetails.forEach((item: any) => {
            content += `${item.date}: ${item.totalSales} sales, ₹${item.totalAmount}\n`;
          });
        }
        break;
      
      case "inventory":
        content += `Total Products: ${data.totalProducts}\n`;
        content += `Low Stock Products: ${data.lowStockProducts}\n\n`;
        if (data.lowStockAlerts && data.lowStockAlerts.length > 0) {
          content += "Low Stock Alerts:\n";
          data.lowStockAlerts.forEach((alert: any) => {
            content += `- ${alert.name}: ${alert.currentStock}/${alert.minStockLevel} (deficit: ${alert.deficit})\n`;
          });
        }
        break;
      
      case "customers":
        content += `Total Customers: ${data.totalCustomers}\n`;
        if (data.loyaltyStats) {
          content += `Total Loyalty Points: ${data.loyaltyStats.totalPoints}\n`;
          content += `Average Points per Customer: ${data.loyaltyStats.avgPointsPerCustomer.toFixed(1)}\n\n`;
          if (data.loyaltyStats.topCustomers && data.loyaltyStats.topCustomers.length > 0) {
            content += "Top Customers:\n";
            data.loyaltyStats.topCustomers.slice(0, 5).forEach((customer: any, index: number) => {
              content += `${index + 1}. ${customer.name}: ₹${customer.totalPurchases}\n`;
            });
          }
        }
        break;
      
      default:
        content += JSON.stringify(data, null, 2);
    }
    
    return content;
  };

  const handleExport = () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    const params: any = {};
    if (dateRange.startDate && dateRange.endDate) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    exportMutation.mutate({
      type: reportType,
      format,
      params,
    });
  };

  const reportTypes = [
    { value: "daily-sales", label: "Daily Sales Report", icon: FileText },
    { value: "inventory", label: "Inventory Report", icon: FileSpreadsheet },
    { value: "customers", label: "Customer Report", icon: FileText },
    { value: "suppliers", label: "Supplier Report", icon: FileText },
    { value: "financial", label: "Financial Report", icon: FileSpreadsheet },
  ];

  const formats = [
    { value: "json", label: "JSON", extension: ".json" },
    { value: "csv", label: "CSV", extension: ".csv" },
    { value: "txt", label: "Text", extension: ".txt" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export & Backup Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger data-testid="select-report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label} ({fmt.extension})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range for Reports */}
          {(reportType === "daily-sales" || reportType === "financial") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="w-full"
            data-testid="button-export"
          >
            {exportMutation.isPending ? (
              "Generating Report..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setReportType("daily-sales");
                setFormat("csv");
                setDateRange({
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                });
                setTimeout(handleExport, 100);
              }}
              data-testid="button-quick-daily-sales"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Today's Sales (CSV)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setReportType("inventory");
                setFormat("csv");
                setTimeout(handleExport, 100);
              }}
              data-testid="button-quick-inventory"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Inventory (CSV)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setReportType("customers");
                setFormat("json");
                setTimeout(handleExport, 100);
              }}
              data-testid="button-quick-customers"
            >
              <FileText className="w-4 h-4 mr-2" />
              Customers (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}