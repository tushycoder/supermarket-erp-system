import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Store, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Receipt, 
  TrendingUp, 
  Bot,
  Settings,
  Download,
  UserCog
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package, badge: 3 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Purchase Orders", href: "/purchase-orders", icon: Package },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Advanced Analytics", href: "/advanced-analytics", icon: BarChart3 },
  { name: "Export & Backup", href: "/export-manager", icon: Download },
  { name: "User Management", href: "/user-management", icon: UserCog },
  { name: "AI Assistant", href: "/ai", icon: Bot },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn("w-64 bg-white shadow-lg flex flex-col", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Store className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SuperMarket</h1>
            <p className="text-sm text-gray-500">ERP System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Store Manager</p>
            <p className="text-sm text-gray-500">admin@store.com</p>
          </div>
          <Settings className="text-gray-400 cursor-pointer hover:text-gray-600" size={20} />
        </div>
      </div>
    </div>
  );
}
