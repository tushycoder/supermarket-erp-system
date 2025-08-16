import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { documentProcessor } from "./ai/documentProcessor";
import { 
  insertProductSchema, 
  insertCustomerSchema, 
  insertSupplierSchema, 
  insertSaleSchema, 
  insertSaleItemSchema 
} from "@shared/schema";
import { BusinessLogic } from "./businessLogic";
import { ReportGenerator } from "./reports";
import { requireAuth } from "./auth";
import { notificationService } from "./notifications";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopSellingProducts(limit);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/dashboard/recent-activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/dashboard/sales-analytics", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const analytics = await storage.getSalesAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Failed to fetch sales analytics" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const sales = await storage.getSales(limit);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const { items, totalAmount, paymentMethod, customerId } = req.body;
      
      // Create sale data structure
      const saleData = {
        customerId: customerId || null,
        userId: null, // Make nullable since user doesn't exist in DB
        subtotal: totalAmount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod || 'cash',
        receiptNumber: `RCP-${Date.now()}`,
        status: 'completed'
      };
      
      // Validate items data
      const itemsData = items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: (parseFloat(item.price) * item.quantity).toString()
      }));
      
      const newSale = await storage.createSale(saleData, itemsData);
      
      // Update inventory and loyalty points
      await BusinessLogic.updateInventoryForSale(itemsData);
      
      if (saleData.customerId) {
        await BusinessLogic.updateLoyaltyPoints(saleData.customerId, parseFloat(saleData.totalAmount));
      }
      
      res.status(201).json(newSale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(400).json({ message: "Failed to create sale", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Invoice processing routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices/upload", upload.single('invoice'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create initial invoice record
      const invoice = await storage.createInvoice({
        filePath: req.file.path,
        status: "processing",
      });

      // Process the invoice asynchronously
      processInvoiceAsync(invoice.id, req.file.path);

      res.status(201).json({ 
        message: "Invoice uploaded successfully", 
        invoiceId: invoice.id,
        status: "processing"
      });
    } catch (error) {
      console.error("Error uploading invoice:", error);
      res.status(500).json({ message: "Failed to upload invoice" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // AI Analysis routes
  app.post("/api/ai/demand-forecast", async (req, res) => {
    try {
      const { productId, days = 30 } = req.body;
      
      // Get historical sales data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 90); // 90 days of history
      
      const historicalData = await storage.getSalesAnalytics(startDate, endDate);
      
      const forecast = await documentProcessor.generateDemandForecast(historicalData);
      res.json(forecast);
    } catch (error) {
      console.error("Error generating demand forecast:", error);
      res.status(500).json({ message: "Failed to generate demand forecast" });
    }
  });

  app.post("/api/ai/supplier-analysis", async (req, res) => {
    try {
      const { supplierId } = req.body;
      
      // Get supplier's purchase orders and performance data
      const purchaseOrders = await storage.getPurchaseOrders();
      const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplierId);
      
      const analysis = await documentProcessor.analyzeSupplierPerformance(supplierId, supplierOrders);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing supplier:", error);
      res.status(500).json({ message: "Failed to analyze supplier" });
    }
  });

  // Barcode lookup route for POS
  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error finding product by barcode:", error);
      res.status(500).json({ message: "Failed to find product" });
    }
  });

  // Customer lookup by phone
  app.get("/api/customers/phone/:phone", async (req, res) => {
    try {
      const customer = await storage.getCustomerByPhone(req.params.phone);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error finding customer by phone:", error);
      res.status(500).json({ message: "Failed to find customer" });
    }
  });

  // Report generation endpoints
  app.get("/api/reports/daily-sales", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const report = await ReportGenerator.generateDailySalesReport(date);
      res.json(report);
    } catch (error) {
      console.error("Error generating daily sales report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports/inventory", async (req, res) => {
    try {
      const report = await ReportGenerator.generateInventoryReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating inventory report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports/customers", async (req, res) => {
    try {
      const report = await ReportGenerator.generateCustomerReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating customer report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports/suppliers", async (req, res) => {
    try {
      const report = await ReportGenerator.generateSupplierReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating supplier report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports/financial", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const report = await ReportGenerator.generateFinancialReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Business insights endpoint
  app.get("/api/insights/daily", async (req, res) => {
    try {
      const insights = await BusinessLogic.generateDailyInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.get("/api/insights/reorder-suggestions", async (req, res) => {
    try {
      const suggestions = await BusinessLogic.getReorderSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating reorder suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // Purchase Order endpoints
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const { supplierId, expectedDeliveryDate, notes, items, totalAmount } = req.body;
      
      const orderData = {
        supplierId,
        userId: null, // Make nullable since user management isn't fully implemented
        orderNumber: `PO-${Date.now()}`,
        expectedDelivery: new Date(expectedDeliveryDate),
        notes: notes || null,
        subtotal: totalAmount,
        totalAmount,
        status: "pending",
      };

      const newOrder = await storage.createPurchaseOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Failed to create purchase order", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Advanced dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/sales-analytics", async (req, res) => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const analytics = await storage.getSalesAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Failed to fetch sales analytics" });
    }
  });

  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const topProducts = await storage.getTopSellingProducts(5);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/dashboard/recent-activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity(10);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // User role management endpoints
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      // Simple user list - in production, implement proper user management
      res.json([{
        id: "admin-user-1",
        email: "admin@supermarket.com",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const { email, firstName, lastName, role, password } = req.body;
      
      // In production, hash the password and store in database
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // In production, update user in database
      res.json({ 
        id, 
        isActive, 
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Notification endpoints
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const history = notificationService.getNotificationHistory(50);
      res.json(history);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/test-low-stock", requireAuth, async (req, res) => {
    try {
      await notificationService.sendLowStockAlert();
      res.json({ message: "Low stock alert sent successfully" });
    } catch (error) {
      console.error("Error sending low stock alert:", error);
      res.status(500).json({ message: "Failed to send low stock alert" });
    }
  });

  app.post("/api/notifications/daily-report", requireAuth, async (req, res) => {
    try {
      await notificationService.sendDailySalesReport();
      res.json({ message: "Daily sales report sent successfully" });
    } catch (error) {
      console.error("Error sending daily report:", error);
      res.status(500).json({ message: "Failed to send daily report" });
    }
  });

  // Export functionality endpoints  
  app.get("/api/export/sales", async (req, res) => {
    try {
      const format = req.query.format as string || 'csv';
      const sales = await storage.getSales(1000);
      
      if (format === 'csv') {
        const csv = sales.map(sale => 
          `${sale.id},${sale.receiptNumber},${sale.totalAmount},${sale.createdAt}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-export.csv');
        res.send('ID,Receipt,Total,Date\n' + csv);
      } else {
        res.json(sales);
      }
    } catch (error) {
      console.error("Error exporting sales:", error);
      res.status(500).json({ message: "Failed to export sales" });
    }
  });

  app.get("/api/export/inventory", async (req, res) => {
    try {
      const format = req.query.format as string || 'csv';
      const products = await storage.getProducts();
      
      if (format === 'csv') {
        const csv = products.map(product => 
          `${product.id},${product.name},${product.sku},${product.currentStock},${product.sellingPrice}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
        res.send('ID,Name,SKU,Stock,Price\n' + csv);
      } else {
        res.json(products);
      }
    } catch (error) {
      console.error("Error exporting inventory:", error);
      res.status(500).json({ message: "Failed to export inventory" });
    }
  });

  app.get("/api/export/customers", async (req, res) => {
    try {
      const format = req.query.format as string || 'csv';
      const customers = await storage.getCustomers();
      
      if (format === 'csv') {
        const csv = customers.map(customer => 
          `${customer.id},${customer.name},${customer.email},${customer.phone},${customer.loyaltyPoints}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers-export.csv');
        res.send('ID,Name,Email,Phone,LoyaltyPoints\n' + csv);
      } else {
        res.json(customers);
      }
    } catch (error) {
      console.error("Error exporting customers:", error);
      res.status(500).json({ message: "Failed to export customers" });
    }
  });

  // User management endpoints (no auth required for testing)
  app.get("/api/users", async (req, res) => {
    try {
      // For now, return sample users since we don't have full user management
      const users = [
        { id: "admin-user-1", email: "admin@supermarket.com", role: "admin", firstName: "Admin", lastName: "User" },
        { id: "manager-user-1", email: "manager@supermarket.com", role: "manager", firstName: "Manager", lastName: "User" },
        { id: "cashier-user-1", email: "cashier@supermarket.com", role: "cashier", firstName: "Cashier", lastName: "User" }
      ];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { email, firstName, lastName, role } = req.body;
      const newUser = {
        id: `${role}-${Date.now()}`,
        email,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      // TODO: Implement actual user creation in storage
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process invoices in the background
async function processInvoiceAsync(invoiceId: string, filePath: string) {
  try {
    console.log(`Processing invoice ${invoiceId}...`);
    
    const extractedData = await documentProcessor.processInvoiceFile(filePath);
    
    // Update invoice with extracted data
    await storage.updateInvoice(invoiceId, {
      status: "processed",
      extractedData: extractedData,

      invoiceNumber: extractedData.invoiceNumber,
      invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : undefined,
      subtotal: extractedData.subtotal?.toString(),
      taxAmount: extractedData.taxAmount?.toString(),
      totalAmount: extractedData.totalAmount?.toString(),
    });

    console.log(`Invoice ${invoiceId} processed successfully`);
  } catch (error) {
    console.error(`Error processing invoice ${invoiceId}:`, error);
    
    // Update invoice with error status
    await storage.updateInvoice(invoiceId, {
      status: "failed",
      processingError: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
