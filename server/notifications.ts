// Email and notification service for SuperMarket ERP
import { storage } from "./storage";

// Notification types
export enum NotificationType {
  LOW_STOCK_ALERT = "low_stock_alert",
  PURCHASE_ORDER_STATUS = "purchase_order_status",
  DAILY_SALES_REPORT = "daily_sales_report",
  CUSTOMER_MILESTONE = "customer_milestone",
  SYSTEM_ALERT = "system_alert",
}

interface NotificationRecipient {
  email: string;
  name?: string;
  role?: string;
}

interface NotificationData {
  type: NotificationType;
  subject: string;
  message: string;
  recipients: NotificationRecipient[];
  priority: "low" | "medium" | "high" | "urgent";
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private emailQueue: NotificationData[] = [];
  private notificationLog: Array<{
    id: string;
    type: NotificationType;
    subject: string;
    recipients: string[];
    status: "pending" | "sent" | "failed";
    createdAt: Date;
    sentAt?: Date;
  }> = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Queue a notification for sending
  async queueNotification(notification: NotificationData): Promise<string> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to queue
    this.emailQueue.push(notification);
    
    // Log the notification
    this.notificationLog.push({
      id: notificationId,
      type: notification.type,
      subject: notification.subject,
      recipients: notification.recipients.map(r => r.email),
      status: "pending",
      createdAt: new Date(),
    });

    // For demo purposes, we'll simulate email sending
    // In production, integrate with services like SendGrid, Mailgun, or AWS SES
    await this.simulateEmailSending(notification, notificationId);
    
    return notificationId;
  }

  // Simulate email sending (replace with actual email service)
  private async simulateEmailSending(notification: NotificationData, id: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📧 EMAIL SENT - ${notification.type.toUpperCase()}`);
      console.log(`Subject: ${notification.subject}`);
      console.log(`Recipients: ${notification.recipients.map(r => r.email).join(", ")}`);
      console.log(`Message: ${notification.message}`);
      console.log(`Priority: ${notification.priority}`);
      console.log("---");

      // Update log
      const logEntry = this.notificationLog.find(log => log.id === id);
      if (logEntry) {
        logEntry.status = "sent";
        logEntry.sentAt = new Date();
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      
      // Update log
      const logEntry = this.notificationLog.find(log => log.id === id);
      if (logEntry) {
        logEntry.status = "failed";
      }
    }
  }

  // Send low stock alerts
  async sendLowStockAlert(): Promise<void> {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      
      if (lowStockProducts.length === 0) return;

      const urgentProducts = lowStockProducts.filter(p => p.currentStock === 0);
      const warningProducts = lowStockProducts.filter(p => p.currentStock > 0);

      let message = "The following products require immediate attention:\n\n";
      
      if (urgentProducts.length > 0) {
        message += "🚨 OUT OF STOCK (Urgent):\n";
        urgentProducts.forEach(product => {
          message += `• ${product.name} (${product.sku}) - 0 ${product.unit} remaining\n`;
        });
        message += "\n";
      }

      if (warningProducts.length > 0) {
        message += "⚠️ LOW STOCK (Warning):\n";
        warningProducts.forEach(product => {
          message += `• ${product.name} (${product.sku}) - ${product.currentStock} ${product.unit} remaining (Min: ${product.minStockLevel})\n`;
        });
      }

      message += "\nPlease reorder these items to avoid stockouts.";

      await this.queueNotification({
        type: NotificationType.LOW_STOCK_ALERT,
        subject: `Low Stock Alert - ${lowStockProducts.length} Products Need Attention`,
        message,
        recipients: [
          { email: "admin@supermarket.com", name: "Store Manager", role: "admin" },
          { email: "inventory@supermarket.com", name: "Inventory Team", role: "manager" },
        ],
        priority: urgentProducts.length > 0 ? "urgent" : "medium",
        data: { lowStockProducts },
      });
    } catch (error) {
      console.error("Failed to send low stock alert:", error);
    }
  }

  // Send daily sales report
  async sendDailySalesReport(): Promise<void> {
    try {
      const today = new Date();
      const dailyStats = await storage.getDailySales(today);
      const recentSales = await storage.getSales(10);

      const message = `Daily Sales Report - ${today.toDateString()}

📊 TODAY'S PERFORMANCE:
• Total Sales: ${dailyStats.totalSales}
• Total Revenue: ₹${dailyStats.totalAmount.toLocaleString()}

📋 RECENT TRANSACTIONS:
${recentSales.slice(0, 5).map(sale => 
  `• ${sale.receiptNumber} - ₹${sale.totalAmount} ${sale.customer ? `(${sale.customer.name})` : '(Walk-in)'}`
).join('\n')}

${dailyStats.totalSales === 0 ? '⚠️ No sales recorded today. Please review operations.' : '✅ Good sales activity today!'}

Best regards,
SuperMarket ERP System`;

      await this.queueNotification({
        type: NotificationType.DAILY_SALES_REPORT,
        subject: `Daily Sales Report - ${today.toDateString()}`,
        message,
        recipients: [
          { email: "admin@supermarket.com", name: "Store Manager", role: "admin" },
          { email: "sales@supermarket.com", name: "Sales Team", role: "manager" },
        ],
        priority: "low",
        data: { dailyStats, recentSales },
      });
    } catch (error) {
      console.error("Failed to send daily sales report:", error);
    }
  }

  // Send customer milestone notifications
  async sendCustomerMilestone(customerId: string, milestone: string): Promise<void> {
    try {
      const customer = await storage.getCustomer(customerId);
      if (!customer) return;

      const message = `🎉 Congratulations ${customer.name}!

You've reached a new milestone: ${milestone}

Current Status:
• Loyalty Points: ${customer.loyaltyPoints}
• Total Purchases: ₹${customer.totalPurchases}
• Member Since: ${new Date(customer.createdAt).toDateString()}

Thank you for being a valued customer!

Best regards,
SuperMarket Team`;

      await this.queueNotification({
        type: NotificationType.CUSTOMER_MILESTONE,
        subject: `Congratulations ${customer.name}! New Milestone Reached`,
        message,
        recipients: [
          { email: customer.email || "customer@example.com", name: customer.name },
        ],
        priority: "low",
        data: { customer, milestone },
      });
    } catch (error) {
      console.error("Failed to send customer milestone notification:", error);
    }
  }

  // Send purchase order status updates
  async sendPurchaseOrderUpdate(orderId: string, status: string): Promise<void> {
    try {
      // In a real implementation, you'd fetch the PO details and supplier info
      const message = `Purchase Order Update

Order ID: ${orderId}
New Status: ${status.toUpperCase()}
Updated: ${new Date().toLocaleString()}

Please check the system for complete details.

Best regards,
SuperMarket ERP System`;

      await this.queueNotification({
        type: NotificationType.PURCHASE_ORDER_STATUS,
        subject: `Purchase Order ${orderId} - Status: ${status}`,
        message,
        recipients: [
          { email: "procurement@supermarket.com", name: "Procurement Team", role: "manager" },
          { email: "admin@supermarket.com", name: "Store Manager", role: "admin" },
        ],
        priority: "medium",
        data: { orderId, status },
      });
    } catch (error) {
      console.error("Failed to send purchase order update:", error);
    }
  }

  // Get notification history
  getNotificationHistory(limit: number = 50): Array<any> {
    return this.notificationLog
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get pending notifications count
  getPendingNotificationsCount(): number {
    return this.notificationLog.filter(log => log.status === "pending").length;
  }

  // Schedule automatic notifications
  startScheduledNotifications(): void {
    // Check for low stock every hour
    setInterval(async () => {
      await this.sendLowStockAlert();
    }, 60 * 60 * 1000); // 1 hour

    // Send daily report every day at 6 PM
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 18 && now.getMinutes() === 0) {
        await this.sendDailySalesReport();
      }
    }, 60 * 1000); // Check every minute

    console.log("📧 Notification scheduler started");
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();