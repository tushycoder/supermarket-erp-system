import { storage } from "./storage";

// Report generation for PDF and Excel exports
export class ReportGenerator {
  
  // Generate daily sales report
  static async generateDailySalesReport(date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const sales = await storage.getSalesAnalytics(startDate, endDate);
    const dailyStats = await storage.getDailySales(date);
    
    return {
      reportDate: date.toISOString().split('T')[0],
      totalSales: dailyStats.totalSales,
      totalAmount: dailyStats.totalAmount,
      salesDetails: sales,
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate inventory report
  static async generateInventoryReport() {
    const products = await storage.getProducts();
    const lowStockProducts = await storage.getLowStockProducts();
    
    return {
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      products: products.map(product => ({
        name: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        status: product.currentStock <= product.minStockLevel ? 'Low Stock' : 'In Stock',
      })),
      lowStockAlerts: lowStockProducts.map(product => ({
        name: product.name,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        deficit: product.minStockLevel - product.currentStock,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate customer report
  static async generateCustomerReport() {
    const customers = await storage.getCustomers();
    
    return {
      totalCustomers: customers.length,
      customers: customers.map(customer => ({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        loyaltyPoints: customer.loyaltyPoints,
        totalPurchases: customer.totalPurchases,
        lastVisit: customer.lastVisit,
        memberSince: customer.createdAt,
      })),
      loyaltyStats: {
        totalPoints: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
        avgPointsPerCustomer: customers.length > 0 ? 
          customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length : 0,
        topCustomers: customers
          .sort((a, b) => parseFloat(b.totalPurchases) - parseFloat(a.totalPurchases))
          .slice(0, 10),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate supplier performance report
  static async generateSupplierReport() {
    const suppliers = await storage.getSuppliers();
    const purchaseOrders = await storage.getPurchaseOrders();
    
    return {
      totalSuppliers: suppliers.length,
      suppliers: suppliers.map(supplier => ({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        gstNumber: supplier.gstNumber,
        paymentTerms: supplier.paymentTerms,
        isActive: supplier.isActive,
      })),
      purchaseStats: {
        totalOrders: purchaseOrders.length,
        // Add more purchase analytics here
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate financial summary report
  static async generateFinancialReport(startDate: Date, endDate: Date) {
    const salesAnalytics = await storage.getSalesAnalytics(startDate, endDate);
    
    const totalRevenue = salesAnalytics.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.totalAmount || "0"), 0);
    
    const totalTax = salesAnalytics.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.taxAmount || "0"), 0);
    
    const totalSales = salesAnalytics.length;
    
    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalRevenue,
        totalTax,
        totalSales,
        avgSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      },
      dailyBreakdown: salesAnalytics,
      generatedAt: new Date().toISOString(),
    };
  }
}