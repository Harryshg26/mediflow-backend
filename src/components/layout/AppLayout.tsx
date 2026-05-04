import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ListOrdered,
  FileText,
  Brain,
  UserPlus,
  Users,
  Package,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Activity,
  Shield,
  Cross,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/queue", icon: ListOrdered, label: "Queue Management" },
  { path: "/prescriptions", icon: FileText, label: "Prescriptions" },
  { path: "/analytics", icon: Brain, label: "AI Analytics" },
  { path: "/checkin", icon: UserPlus, label: "Patient Check-In" },
  { path: "/staff", icon: Users, label: "Staff & Resources" },
  { path: "/stock", icon: Package, label: "Stock & Inventory" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadCount } = trpc.alert.getUnreadCount.useQuery();

  return (
    <div className="flex h-screen bg-[#F4F6F8]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-[#E4E6E8] z-40 flex flex-col transition-all duration-200",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-[#E4E6E8]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#005EB8] flex items-center justify-center flex-shrink-0">
              <Cross className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-[#2B2B2B] text-sm truncate">MediFlow AI</span>
                <span className="text-[10px] font-semibold bg-[#005EB8]/10 text-[#005EB8] px-1.5 py-0.5 rounded">BETA</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[rgba(0,94,184,0.08)] text-[#005EB8] border-l-[3px] border-l-[#005EB8]"
                    : "text-[#4A5568] hover:bg-[rgba(0,0,0,0.03)] border-l-[3px] border-l-transparent"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-[#005EB8]")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-2 p-2 rounded-md hover:bg-[rgba(0,0,0,0.03)] text-[#718096] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Profile */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F4F6F8]">
              <div className="w-8 h-8 rounded-full bg-[#005EB8]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#005EB8]">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#2B2B2B] truncate">
                  {user?.name || "Pharmacy Manager"}
                </p>
                <p className="text-[10px] text-[#718096] truncate">
                  {user?.role === "admin" ? "Administrator" : "Pharmacy Staff"}
                </p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-200",
          collapsed ? "ml-[64px]" : "ml-[240px]"
        )}
      >
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[#E4E6E8] flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Left: Hospital Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F6F8] rounded-md">
              <Shield className="w-4 h-4 text-[#005EB8]" />
              <span className="text-sm font-medium text-[#2B2B2B]">St Thomas&apos; Hospital Pharmacy</span>
            </div>
            <span className="text-xs bg-[#C6F6D5] text-[#1A6B4D] px-2 py-0.5 rounded-full font-medium">
              Afternoon Shift
            </span>
          </div>

          {/* Center: AI Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(26,107,77,0.08)] rounded-full">
              <Activity className="w-3.5 h-3.5 text-[#1A6B4D]" />
              <span className="text-xs font-medium text-[#1A6B4D]">AI Agent Active</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-[#718096]">Last sync: 12s ago</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prescriptions, patients..."
                className="pl-9 pr-4 py-1.5 w-64 text-sm bg-[#F4F6F8] rounded-md border-0 focus:ring-2 focus:ring-[#005EB8]/25 placeholder:text-[#718096]"
              />
            </div>
            <button className="relative p-2 rounded-md hover:bg-[#F4F6F8] transition-colors">
              <Bell className="w-5 h-5 text-[#4A5568]" />
              {unreadCount ? (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C53030] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
