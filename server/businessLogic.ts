import { storage } from "./storage";

// Enhanced business logic for inventory updates and loyalty points
export class BusinessLogic {
  
  // Update inventory when sale is made
  static async updateInventoryForSale(saleItems: Array<{ productId: string; quantity: number }>) {
    for (const item of saleItems) {
      const product = await storage.getProduct(item.productId);
      if (product) {
        const newStock = product.currentStock - item.quantity;
        await storage.updateProductStock(item.productId, newStock);
        
        // Create stock movement record
        await storage.createStockMovement({
          productId: item.productId,
          movementType: "out",
          quantity: item.quantity,
          reason: "Sale",
          referenceId: null,
        });
      }
    }
  }

  // Calculate and update loyalty points
  static async updateLoyaltyPoints(customerId: string, purchaseAmount: number) {
    const pointsEarned = Math.floor(purchaseAmount / 10); // 1 point per ₹10
    
    const customer = await storage.getCustomer(customerId);
    if (customer) {
      const newPoints = customer.loyaltyPoints + pointsEarned;
      const newTotalPurchases = parseFloat(customer.totalPurchases) + purchaseAmount;
      
      await storage.updateCustomer(customerId, {
        loyaltyPoints: newPoints,
        totalPurchases: newTotalPurchases.toFixed(2),
        lastVisit: new Date(),
      });
    }
    
    return pointsEarned;
  }

  // Generate business insights
  static async generateDailyInsights() {
    const today = new Date();
    const dailySales = await storage.getDailySales(today);
    const lowStockProducts = await storage.getLowStockProducts();
    const totalProducts = await storage.getProducts();
    
    return {
      dailySales,
      lowStockAlert: lowStockProducts.length,
      totalProducts: totalProducts.length,
      insights: [
        dailySales.totalSales > 0 ? `${dailySales.totalSales} sales completed today` : "No sales today",
        lowStockProducts.length > 0 ? `${lowStockProducts.length} products need restocking` : "All products well stocked",
        `Total inventory: ${totalProducts.length} products`,
      ]
    };
  }

  // Calculate tax based on product category
  static calculateTax(amount: number, category: string = "general"): number {
    const taxRates = {
      "dairy": 0.05,      // 5% for dairy
      "grains": 0.00,     // 0% for essential grains
      "general": 0.18,    // 18% standard GST
      "luxury": 0.28,     // 28% for luxury items
    };
    
    const rate = taxRates[category.toLowerCase()] || taxRates.general;
    return amount * rate;
  }

  // Suggest reorder quantities based on sales velocity
  static async getReorderSuggestions() {
    const products = await storage.getProducts();
    const suggestions = [];
    
    for (const product of products) {
      if (product.currentStock <= product.minStockLevel) {
        const suggestedOrder = Math.max(
          product.maxStockLevel - product.currentStock,
          product.minStockLevel * 2
        );
        
        suggestions.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.currentStock,
          minLevel: product.minStockLevel,
          suggestedOrderQuantity: suggestedOrder,
          priority: product.currentStock === 0 ? "urgent" : "normal"
        });
      }
    }
    
    return suggestions.sort((a, b) => 
      a.priority === "urgent" && b.priority !== "urgent" ? -1 : 
      a.priority !== "urgent" && b.priority === "urgent" ? 1 : 0
    );
  }
}