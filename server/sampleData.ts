import { storage } from "./storage";

// Sample data for testing the ERP system
export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Sample products
    const sampleProducts = [
      {
        name: "Basmati Rice",
        sku: "RICE-001",
        barcode: "8901030895166",
        category: "Grains",
        description: "Premium quality Basmati rice 1kg pack",
        costPrice: "45.00",
        sellingPrice: "65.00",
        currentStock: 150,
        minStockLevel: 20,
        maxStockLevel: 300,
        unit: "kg",
      },
      {
        name: "Tata Salt",
        sku: "SALT-001", 
        barcode: "8901030895167",
        category: "Spices & Condiments",
        description: "Iodized salt 1kg pack",
        costPrice: "18.00",
        sellingPrice: "25.00",
        currentStock: 200,
        minStockLevel: 30,
        maxStockLevel: 400,
        unit: "kg",
      },
      {
        name: "Amul Milk",
        sku: "MILK-001",
        barcode: "8901030895168", 
        category: "Dairy",
        description: "Fresh full cream milk 500ml",
        costPrice: "22.00",
        sellingPrice: "30.00",
        currentStock: 80,
        minStockLevel: 10,
        maxStockLevel: 100,
        unit: "pcs",
      },
      {
        name: "Maggi Noodles",
        sku: "NOOD-001",
        barcode: "8901030895169",
        category: "Packaged Food",
        description: "2-minute masala noodles",
        costPrice: "10.00", 
        sellingPrice: "15.00",
        currentStock: 50,
        minStockLevel: 15,
        maxStockLevel: 200,
        unit: "pcs",
      },
      {
        name: "Sunflower Oil",
        sku: "OIL-001",
        barcode: "8901030895170",
        category: "Cooking Oil",
        description: "Refined sunflower oil 1L",
        costPrice: "85.00",
        sellingPrice: "110.00", 
        currentStock: 25,
        minStockLevel: 5,
        maxStockLevel: 50,
        unit: "L",
      }
    ];

    // Sample customers
    const sampleCustomers = [
      {
        name: "Rajesh Kumar",
        phone: "9876543210",
        email: "rajesh.kumar@email.com",
        address: "123 Main Street, Mumbai",
        loyaltyPoints: 150,
        totalPurchases: "1250.00",
      },
      {
        name: "Priya Sharma",
        phone: "9876543211", 
        email: "priya.sharma@email.com",
        address: "456 Park Road, Delhi",
        loyaltyPoints: 85,
        totalPurchases: "850.00",
      },
      {
        name: "Amit Patel",
        phone: "9876543212",
        email: "amit.patel@email.com", 
        address: "789 Gandhi Nagar, Ahmedabad",
        loyaltyPoints: 220,
        totalPurchases: "2200.00",
      }
    ];

    // Sample suppliers
    const sampleSuppliers = [
      {
        name: "A.K. Enterprises",
        contactPerson: "Ashok Kumar",
        email: "ak.enterprises@email.com",
        phone: "9876501234",
        address: "Industrial Area, Sector 15, Noida",
        gstNumber: "07AABCA1234M1Z5",
        panNumber: "AABCA1234M",
        paymentTerms: "30 days",
      },
      {
        name: "Praveen Traders", 
        contactPerson: "Praveen Singh",
        email: "praveen.traders@email.com",
        phone: "9876501235",
        address: "Wholesale Market, Karol Bagh, Delhi",
        gstNumber: "07BBCDA5678N2Y6",
        panNumber: "BBCDA5678N",
        paymentTerms: "15 days",
      },
      {
        name: "Shiva Sales",
        contactPerson: "Shiva Reddy",
        email: "shiva.sales@email.com", 
        phone: "9876501236",
        address: "Market Yard, Pune",
        gstNumber: "27CCDEB9012P3X7",
        panNumber: "CCDEB9012P", 
        paymentTerms: "Cash on delivery",
      }
    ];

    // Insert sample data
    for (const product of sampleProducts) {
      await storage.createProduct(product);
    }
    console.log(`✓ Created ${sampleProducts.length} sample products`);

    for (const customer of sampleCustomers) {
      await storage.createCustomer(customer);
    }
    console.log(`✓ Created ${sampleCustomers.length} sample customers`);

    for (const supplier of sampleSuppliers) {
      await storage.createSupplier(supplier);
    }
    console.log(`✓ Created ${sampleSuppliers.length} sample suppliers`);

    console.log("✅ Database seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}