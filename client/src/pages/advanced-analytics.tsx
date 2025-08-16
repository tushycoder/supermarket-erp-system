import { Sidebar } from "@/components/sidebar";
import { AdvancedDashboard } from "@/components/analytics/advanced-dashboard";

export default function AdvancedAnalytics() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <AdvancedDashboard />
        </main>
      </div>
    </div>
  );
}