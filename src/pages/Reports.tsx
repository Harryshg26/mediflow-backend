import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  FileText,
  Calendar,
  Download,
  Clock,
  Users,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const reportTabs = [
  { key: "daily", label: "Daily Operations", icon: FileText },
  { key: "weekly", label: "Weekly Summary", icon: Calendar },
  { key: "staff", label: "Staff Performance", icon: Users },
  { key: "stock", label: "Stock & Waste", icon: Pill },
  { key: "compliance", label: "Compliance", icon: CheckCircle2 },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("daily");
  const { data: hourlyData } = trpc.analytics.getHourlyBreakdown.useQuery();
  const { data: staffEfficiency } = trpc.analytics.getStaffEfficiency.useQuery();
  trpc.analytics.getWaitTimeTrends.useQuery({ days: 7 });

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2B2B]">Reports</h1>
            <p className="text-sm text-[#718096] mt-0.5">Generate and view operational reports</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#005EB8] text-white rounded-md text-sm font-medium hover:bg-[#004A94] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.key ? "bg-[#005EB8] text-white" : "text-[#4A5568] hover:bg-[#F4F6F8]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#718096]" />
            <span className="text-sm text-[#4A5568]">Date Range:</span>
          </div>
          <input type="date" defaultValue="2026-05-01" className="px-3 py-1.5 bg-[#F4F6F8] rounded-md text-sm border-0" />
          <span className="text-sm text-[#718096]">to</span>
          <input type="date" defaultValue="2026-05-03" className="px-3 py-1.5 bg-[#F4F6F8] rounded-md text-sm border-0" />
          <button className="ml-auto px-3 py-1.5 bg-[#F4F6F8] text-[#4A5568] text-sm rounded-md hover:bg-[#E4E6E8] transition-colors">
            Generate Report
          </button>
        </div>

        {/* Report Content */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Processed", value: "142", change: "+12% vs yesterday", icon: Pill, color: "#005EB8" },
                { label: "Avg Wait Time", value: "18 min", change: "-3 min improvement", icon: Clock, color: "#1A6B4D" },
                { label: "Peak Hour", value: "15:00", change: "32 prescriptions", icon: AlertTriangle, color: "#D69E2E" },
                { label: "Staff on Duty", value: "6", change: "2 pharmacists, 4 techs", icon: Users, color: "#718096" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs text-[#718096]">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-[#2B2B2B]">{stat.value}</p>
                  <p className="text-[11px] text-[#1A6B4D] mt-0.5">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Wait Times by Hour</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hourlyData ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E8" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#718096" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#718096" }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Line type="monotone" dataKey="avgWaitTime" stroke="#C53030" strokeWidth={2} dot={false} name="Wait (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Prescriptions Processed by Hour</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyData ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E8" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#718096" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#718096" }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Bar dataKey="prescriptions" fill="#005EB8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-[#FFFBEB] rounded-lg p-4 flex items-start gap-3">
              <Brain className="w-5 h-5 text-[#D69E2E] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#2B2B2B]">AI Insight</p>
                <p className="text-xs text-[#4A5568] mt-1">
                  Wait times exceeded the 15-minute target between 14:00-15:00. Consider adding 1 additional dispenser 
                  during this peak period. Based on historical patterns, Tuesday afternoons consistently show 35% higher 
                  prescription volume.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F6F8]">
                  {["Staff Member", "Role", "Prescriptions Handled", "Avg Processing Time", "Efficiency Score"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffEfficiency?.map((s) => (
                  <tr key={s.id} className="border-b border-[#F4F6F8]">
                    <td className="px-4 py-3 text-sm font-medium text-[#2B2B2B]">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        s.role === "pharmacist" ? "bg-[#DBEAFE] text-[#005EB8]" : "bg-[#C6F6D5] text-[#1A6B4D]"
                      )}>
                        {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4A5568]">{s.prescriptionsHandled}</td>
                    <td className="px-4 py-3 text-sm text-[#4A5568]">{s.avgProcessingTime} min</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1A6B4D] rounded-full"
                            style={{ width: `${Math.min(s.efficiency, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#1A6B4D]">{s.efficiency}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report History */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4">Report History</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8]">
                {["Report Name", "Type", "Date Range", "Generated", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Daily Operations Report", type: "Daily", range: "3 May 2026", generated: "Today 16:00", status: "Ready" },
                { name: "Weekly Performance Summary", type: "Weekly", range: "28 Apr - 3 May", generated: "Today 12:00", status: "Ready" },
                { name: "Staff Efficiency Report", type: "Staff", range: "1-30 Apr 2026", generated: "Yesterday", status: "Ready" },
                { name: "Stock Analysis", type: "Stock", range: "Apr 2026", generated: "2 May 2026", status: "Ready" },
                { name: "Compliance Audit", type: "Compliance", range: "Q1 2026", generated: "1 May 2026", status: "Scheduled" },
              ].map((report, i) => (
                <tr key={i} className="border-b border-[#F4F6F8]">
                  <td className="px-4 py-2.5 text-sm text-[#2B2B2B]">{report.name}</td>
                  <td className="px-4 py-2.5 text-xs text-[#4A5568]">{report.type}</td>
                  <td className="px-4 py-2.5 text-xs text-[#4A5568]">{report.range}</td>
                  <td className="px-4 py-2.5 text-xs text-[#4A5568]">{report.generated}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      report.status === "Ready" ? "bg-[#C6F6D5] text-[#1A6B4D]" : "bg-[#FEFCBF] text-[#D69E2E]"
                    )}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="text-xs text-[#005EB8] hover:underline">Download PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
