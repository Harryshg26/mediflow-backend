import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Brain,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Stock() {
  const { data: stockItems } = trpc.stock.list.useQuery();
  const { data: stockStats } = trpc.stock.getStats.useQuery();
  trpc.stock.getLowStock.useQuery();

  const usageData = [
    { drug: "Amox", current: 42, predicted: 58 },
    { drug: "Metf", current: 38, predicted: 50 },
    { drug: "Parac", current: 85, predicted: 92 },
    { drug: "Atorv", current: 28, predicted: 30 },
    { drug: "Amlod", current: 22, predicted: 25 },
    { drug: "Omep", current: 18, predicted: 20 },
    { drug: "Salb", current: 25, predicted: 38 },
    { drug: "Warf", current: 12, predicted: 14 },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]">Stock & Inventory</h1>
          <p className="text-sm text-[#718096] mt-0.5">Medication stock levels, AI demand prediction, and reorder alerts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total SKUs", value: stockStats?.total ?? 1247, detail: "98.2% availability", icon: Package, color: "#005EB8" },
            { label: "Low Stock", value: stockStats?.low ?? 23, detail: `${stockStats?.critical ?? 12} critical`, icon: AlertTriangle, color: "#D69E2E" },
            { label: "Out of Stock", value: stockStats?.outOfStock ?? 4, detail: "2 with substitutes", icon: ShoppingCart, color: "#C53030" },
            { label: "Pending Orders", value: 8, detail: "3 arriving today", icon: TrendingUp, color: "#1A6B4D" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <span className="text-xs text-[#718096]">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#2B2B2B]">{card.value}</p>
              <p className="text-[11px] text-[#718096] mt-1">{card.detail}</p>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E6E8] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D69E2E]" />
            <h3 className="text-sm font-semibold text-[#2B2B2B]">Low Stock Alerts</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8]">
                {["Drug Name", "Strength", "Form", "Current Stock", "Reorder Point", "AI Predicted Runout", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockItems?.filter((s) => s.status !== "normal").map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-[#F4F6F8] hover:bg-[rgba(0,0,0,0.02)] transition-colors",
                    item.status === "critical" || item.status === "out_of_stock" ? "border-l-4 border-l-[#C53030]" : "border-l-4 border-l-[#D69E2E]"
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#2B2B2B]">{item.drugName}</td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{item.strength}</td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{item.form}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-sm font-semibold",
                      item.currentStock <= 5 ? "text-[#C53030]" : "text-[#D69E2E]"
                    )}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-[#718096]"> {item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{item.reorderPoint} {item.unit}</td>
                  <td className="px-4 py-3 text-xs text-[#C53030] font-medium">
                    {item.aiPredictedRunout ? new Date(item.aiPredictedRunout).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      item.status === "out_of_stock" ? "bg-[#FED7D7] text-[#C53030]" :
                      item.status === "critical" ? "bg-[#FED7D7] text-[#C53030]" :
                      "bg-[#FEFCBF] text-[#D69E2E]"
                    )}>
                      {item.status === "out_of_stock" ? "Out of Stock" : item.status === "critical" ? "Critical" : "Low"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-2.5 py-1 bg-[#1A6B4D] text-white text-xs rounded hover:bg-[#145A3F] transition-colors">
                      Order Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Demand Predictions + Usage Chart */}
        <div className="grid grid-cols-2 gap-4">
          {/* AI Predictions */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-[#1A6B4D]" />
              <h3 className="text-sm font-semibold text-[#2B2B2B]">AI Demand Predictions</h3>
            </div>
            <p className="text-xs text-[#4A5568] mb-3">AI predicts increased demand next week for:</p>
            <div className="space-y-3">
              {[
                { drug: "Amoxicillin 500mg", increase: "+40%", reason: "Seasonal respiratory infections trending up 35%" },
                { drug: "Paracetamol 500mg", increase: "+25%", reason: "Flu season peak predicted" },
                { drug: "Ibuprofen 400mg", increase: "+15%", reason: "Post-viral pain management" },
              ].map((pred) => (
                <div key={pred.drug} className="flex items-start gap-3 p-3 rounded-md bg-[#F4F6F8]">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-[#C53030]" />
                    <span className="text-sm font-bold text-[#C53030]">{pred.increase}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2B2B2B]">{pred.drug}</p>
                    <p className="text-xs text-[#718096]">{pred.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 bg-[#1A6B4D] text-white text-sm rounded-md hover:bg-[#145A3F] transition-colors">
              Auto-generate Order
            </button>
          </div>

          {/* Usage Chart */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Weekly Usage — Top Drugs</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E8" />
                <XAxis dataKey="drug" tick={{ fontSize: 10, fill: "#718096" }} />
                <YAxis tick={{ fontSize: 10, fill: "#718096" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="current" fill="#005EB8" name="This Week" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgba(0,94,184,0.3)" name="Predicted Next" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
