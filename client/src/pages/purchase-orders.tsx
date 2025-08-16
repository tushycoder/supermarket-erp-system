import { Sidebar } from "@/components/sidebar";
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form";

export default function PurchaseOrders() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-600">Create and manage purchase orders</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <PurchaseOrderForm />
        </main>
      </div>
    </div>
  );
}