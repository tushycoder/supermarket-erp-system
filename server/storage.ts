import {
  products,
  customers,
  suppliers,
  sales,
  saleItems,
  purchaseOrders,
  invoices,
  stockMovements,
  users,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Supplier,
  type InsertSupplier,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type Invoice,
  type InsertInvoice,
  type StockMovement,
  type InsertStockMovement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sum, count, and, gte, lte, sql, like } from "drizzle-orm";

export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(): Promise<Product[]>;
  updateProductStock(id: string, quantity: number): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Sales operations
  getSales(limit?: number): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] })[]>;
  getSale(id: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] }) | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;
  getDailySales(date: Date): Promise<{ totalSales: number; totalAmount: number }>;
  getSalesAnalytics(startDate: Date, endDate: Date): Promise<any>;

  // Purchase Order operations
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;

  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Stock movement operations
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(productId?: string): Promise<StockMovement[]>;

  // Dashboard analytics
  getDashboardStats(): Promise<{
    todaySales: number;
    totalProducts: number;
    activeCustomers: number;
    pendingOrders: number;
    lowStockCount: number;
  }>;

  getTopSellingProducts(limit?: number): Promise<any[]>;
  getRecentActivity(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.currentStock} <= ${products.minStockLevel}`
        )
      )
      .orderBy(asc(products.currentStock));
  }

  async updateProductStock(id: string, quantity: number): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ 
        currentStock: sql`${products.currentStock} + ${quantity}`,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.name} ILIKE ${'%' + query + '%'} OR ${products.sku} ILIKE ${'%' + query + '%'} OR ${products.barcode} ILIKE ${'%' + query + '%'}`
        )
      )
      .limit(20);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.isActive, true)).orderBy(asc(customers.name));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.update(customers).set({ isActive: false }).where(eq(customers.id, id));
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers).where(eq(suppliers.isActive, true)).orderBy(asc(suppliers.name));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
  }

  // Sales operations
  async getSales(limit: number = 50): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] })[]> {
    const salesData = await db
      .select({
        sale: sales,
        customer: customers,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    const salesWithItems = await Promise.all(
      salesData.map(async (saleData) => {
        const items = await db
          .select({
            saleItem: saleItems,
            product: products,
          })
          .from(saleItems)
          .leftJoin(products, eq(saleItems.productId, products.id))
          .where(eq(saleItems.saleId, saleData.sale.id));

        return {
          ...saleData.sale,
          customer: saleData.customer || undefined,
          items: items.map(item => ({ ...item.saleItem, product: item.product! })),
        };
      })
    );

    return salesWithItems;
  }

  async getSale(id: string): Promise<(Sale & { customer?: Customer; items: (SaleItem & { product: Product })[] }) | undefined> {
    const [saleData] = await db
      .select({
        sale: sales,
        customer: customers,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(eq(sales.id, id));

    if (!saleData) return undefined;

    const items = await db
      .select({
        saleItem: saleItems,
        product: products,
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, id));

    return {
      ...saleData.sale,
      customer: saleData.customer || undefined,
      items: items.map(item => ({ ...item.saleItem, product: item.product! })),
    };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    return db.transaction(async (tx) => {
      // Create the sale
      const [newSale] = await tx.insert(sales).values(sale).returning();

      // Create sale items and update stock
      for (const item of items) {
        await tx.insert(saleItems).values({
          ...item,
          saleId: newSale.id,
        });

        // Update product stock
        await tx
          .update(products)
          .set({ 
            currentStock: sql`${products.currentStock} - ${item.quantity}`,
            updatedAt: new Date()
          })
          .where(eq(products.id, item.productId));

        // Record stock movement
        await tx.insert(stockMovements).values({
          productId: item.productId,
          movementType: "sale",
          quantity: -item.quantity,
          referenceId: newSale.id,
          referenceType: "sale",
        });
      }

      // Update customer's last visit and total purchases if customer exists
      if (sale.customerId) {
        await tx
          .update(customers)
          .set({
            lastVisit: new Date(),
            totalPurchases: sql`${customers.totalPurchases} + ${sale.totalAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, sale.customerId));
      }

      return newSale;
    });
  }

  async getDailySales(date: Date): Promise<{ totalSales: number; totalAmount: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db
      .select({
        totalSales: count(sales.id),
        totalAmount: sum(sales.totalAmount),
      })
      .from(sales)
      .where(
        and(
          gte(sales.createdAt, startOfDay),
          lte(sales.createdAt, endOfDay),
          eq(sales.status, "completed")
        )
      );

    return {
      totalSales: Number(result.totalSales) || 0,
      totalAmount: Number(result.totalAmount) || 0,
    };
  }

  async getSalesAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const result = await db
      .select({
        date: sql`DATE(${sales.createdAt})`.as("date"),
        totalSales: count(sales.id),
        totalAmount: sum(sales.totalAmount),
      })
      .from(sales)
      .where(
        and(
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate),
          eq(sales.status, "completed")
        )
      )
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(sql`DATE(${sales.createdAt})`);

    return result.map(row => ({
      date: row.date,
      totalSales: Number(row.totalSales),
      totalAmount: Number(row.totalAmount),
    }));
  }

  // Purchase Order operations
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  // Stock movement operations
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }

  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    const query = db.select().from(stockMovements);
    if (productId) {
      return query.where(eq(stockMovements.productId, productId)).orderBy(desc(stockMovements.createdAt));
    }
    return query.orderBy(desc(stockMovements.createdAt)).limit(100);
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    todaySales: number;
    totalProducts: number;
    activeCustomers: number;
    pendingOrders: number;
    lowStockCount: number;
  }> {
    const today = new Date();
    const { totalAmount } = await this.getDailySales(today);

    const [productCount] = await db
      .select({ count: count(products.id) })
      .from(products)
      .where(eq(products.isActive, true));

    const [customerCount] = await db
      .select({ count: count(customers.id) })
      .from(customers)
      .where(eq(customers.isActive, true));

    const [pendingOrderCount] = await db
      .select({ count: count(purchaseOrders.id) })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.status, "pending"));

    const [lowStockCount] = await db
      .select({ count: count(products.id) })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.currentStock} <= ${products.minStockLevel}`
        )
      );

    return {
      todaySales: totalAmount,
      totalProducts: Number(productCount.count),
      activeCustomers: Number(customerCount.count),
      pendingOrders: Number(pendingOrderCount.count),
      lowStockCount: Number(lowStockCount.count),
    };
  }

  async getTopSellingProducts(limit: number = 5): Promise<any[]> {
    const result = await db
      .select({
        product: products,
        totalQuantity: sum(saleItems.quantity),
        totalRevenue: sum(saleItems.totalPrice),
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .leftJoin(sales, eq(saleItems.saleId, sales.id))
      .where(eq(sales.status, "completed"))
      .groupBy(products.id, products.name, products.sku, products.category, products.currentStock)
      .orderBy(desc(sum(saleItems.quantity)))
      .limit(limit);

    return result.map(row => ({
      ...row.product,
      totalQuantity: Number(row.totalQuantity),
      totalRevenue: Number(row.totalRevenue),
    }));
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const recentSales = await db
      .select({
        type: sql`'sale'`.as("type"),
        description: sql`'Sale completed'`.as("description"),
        details: sql`CONCAT('Customer: ', COALESCE(${customers.name}, 'Walk-in'), ' - ₹', ${sales.totalAmount})`.as("details"),
        timestamp: sales.createdAt,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(eq(sales.status, "completed"))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    return recentSales.map(activity => ({
      type: activity.type,
      description: activity.description,
      details: activity.details,
      timestamp: activity.timestamp,
    }));
  }
}

export const storage = new DatabaseStorage();
