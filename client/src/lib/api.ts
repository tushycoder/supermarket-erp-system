import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => apiRequest("GET", "/api/dashboard/stats"),
  getTopProducts: (limit = 5) => apiRequest("GET", `/api/dashboard/top-products?limit=${limit}`),
  getRecentActivity: (limit = 10) => apiRequest("GET", `/api/dashboard/recent-activity?limit=${limit}`),
  getSalesAnalytics: (days = 7) => apiRequest("GET", `/api/dashboard/sales-analytics?days=${days}`),

  // Products
  getProducts: () => apiRequest("GET", "/api/products"),
  getProduct: (id: string) => apiRequest("GET", `/api/products/${id}`),
  createProduct: (product: any) => apiRequest("POST", "/api/products", product),
  updateProduct: (id: string, product: any) => apiRequest("PUT", `/api/products/${id}`, product),
  deleteProduct: (id: string) => apiRequest("DELETE", `/api/products/${id}`),
  searchProducts: (query: string) => apiRequest("GET", `/api/products/search?q=${encodeURIComponent(query)}`),
  getLowStockProducts: () => apiRequest("GET", "/api/products/low-stock"),
  getProductByBarcode: (barcode: string) => apiRequest("GET", `/api/products/barcode/${barcode}`),

  // Customers
  getCustomers: () => apiRequest("GET", "/api/customers"),
  getCustomer: (id: string) => apiRequest("GET", `/api/customers/${id}`),
  createCustomer: (customer: any) => apiRequest("POST", "/api/customers", customer),
  updateCustomer: (id: string, customer: any) => apiRequest("PUT", `/api/customers/${id}`, customer),

  // Suppliers
  getSuppliers: () => apiRequest("GET", "/api/suppliers"),
  getSupplier: (id: string) => apiRequest("GET", `/api/suppliers/${id}`),
  createSupplier: (supplier: any) => apiRequest("POST", "/api/suppliers", supplier),

  // Sales
  getSales: (limit = 50) => apiRequest("GET", `/api/sales?limit=${limit}`),
  getSale: (id: string) => apiRequest("GET", `/api/sales/${id}`),
  createSale: (sale: any, items: any[]) => apiRequest("POST", "/api/sales", { sale, items }),

  // Invoices
  getInvoices: () => apiRequest("GET", "/api/invoices"),
  getInvoice: (id: string) => apiRequest("GET", `/api/invoices/${id}`),
  uploadInvoice: (formData: FormData) => apiRequest("POST", "/api/invoices/upload", formData),

  // AI
  generateDemandForecast: (data: any) => apiRequest("POST", "/api/ai/demand-forecast", data),
  analyzeSupplier: (supplierId: string) => apiRequest("POST", "/api/ai/supplier-analysis", { supplierId }),
};
