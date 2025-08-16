import { Sidebar } from "@/components/sidebar";
import { EnhancedPOSTerminal } from "@/components/pos/enhanced-pos-terminal";

export default function POS() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
              <p className="text-gray-500">Process customer transactions quickly and efficiently</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <EnhancedPOSTerminal />
        </main>
      </div>
    </div>
  );
}
