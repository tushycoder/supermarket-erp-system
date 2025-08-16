import { Sidebar } from "@/components/sidebar";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Truck } from "lucide-react";
import { useState } from "react";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="text-primary" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
                <p className="text-gray-500">Manage supplier relationships and purchase orders</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                  data-testid="supplier-search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center space-x-2"
                data-testid="add-supplier-button"
              >
                <Plus size={16} />
                <span>Add Supplier</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <SupplierList searchQuery={searchQuery} />
        </main>
      </div>

      <AddSupplierDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}
