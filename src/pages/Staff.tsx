import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  Activity,
  Coffee,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Staff() {
  const { data: staffList } = trpc.staff.list.useQuery();
  const { data: recommendations } = trpc.ai.getStaffRecommendations.useQuery();

  const activeStaff = staffList?.filter((s) => s.status === "active") ?? [];
  void recommendations;
  const onBreak = staffList?.filter((s) => s.status === "onbreak") ?? [];

  const avgWorkload = staffList && staffList.length > 0
    ? Math.round(staffList.filter((s) => s.role !== "manager").reduce((sum, s) => sum + s.prescriptionsHandled, 0) / (staffList.filter((s) => s.role !== "manager").length || 1))
    : 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]">Staff & Resources</h1>
          <p className="text-sm text-[#718096] mt-0.5">Staff roster, workload distribution, and resource management</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "On Duty",
              value: activeStaff.length,
              detail: `${staffList?.filter((s) => s.role === "pharmacist").length} Pharmacists, ${staffList?.filter((s) => s.role === "technician").length} Technicians`,
              icon: Users,
              color: "#1A6B4D",
            },
            {
              label: "Avg Workload",
              value: `${Math.min(avgWorkload, 100)}%`,
              detail: "Capacity utilization",
              icon: Activity,
              color: "#005EB8",
            },
            {
              label: "Queue per Staff",
              value: "4.0",
              detail: "Target: 3.5",
              icon: TrendingUp,
              color: "#D69E2E",
            },
            {
              label: "Break Coverage",
              value: `${onBreak.length} on break`,
              detail: `${activeStaff.length} staff covering`,
              icon: Coffee,
              color: "#718096",
            },
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

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E6E8] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#2B2B2B]">Staff Workload</h3>
            <button className="px-3 py-1.5 bg-[#005EB8] text-white text-xs rounded-md hover:bg-[#004A94] transition-colors">
              + Add Staff
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8]">
                {["Staff Member", "Role", "Status", "Prescriptions Today", "Avg Processing", "Current Task", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList?.map((member) => (
                <tr key={member.id} className="border-b border-[#F4F6F8] hover:bg-[rgba(0,0,0,0.02)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#005EB8]/10 flex items-center justify-center flex-shrink-0">
                        <img
                          src="/staff-avatar-placeholder.jpg"
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className="text-xs font-semibold text-[#005EB8]">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2B2B2B]">{member.name}</p>
                        <p className="text-[11px] text-[#718096]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      member.role === "pharmacist" ? "bg-[#DBEAFE] text-[#005EB8]" :
                      member.role === "technician" ? "bg-[#C6F6D5] text-[#1A6B4D]" :
                      "bg-[#FEFCBF] text-[#D69E2E]"
                    )}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        member.status === "active" ? "bg-green-500" :
                        member.status === "onbreak" ? "bg-[#D69E2E]" :
                        "bg-[#718096]"
                      )} />
                      <span className="text-xs text-[#4A5568]">
                        {member.status === "active" ? "Active" : member.status === "onbreak" ? "On Break" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#005EB8] rounded-full"
                          style={{ width: `${Math.min((member.prescriptionsHandled / 35) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#4A5568]">{member.prescriptionsHandled}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">
                    {member.avgProcessingTime ? `${member.avgProcessingTime} min` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A5568] max-w-[200px] truncate">
                    {member.currentTask || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-[#005EB8] hover:underline">Assign Task</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Staffing Recommendations */}
        <div
          className="rounded-lg p-5 border border-[#1A6B4D]/20"
          style={{ background: "linear-gradient(135deg, rgba(26,107,77,0.08) 0%, rgba(0,94,184,0.04) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#1A6B4D]" />
            <h3 className="text-sm font-semibold text-[#2B2B2B]">AI Staffing Insights</h3>
          </div>
          <p className="text-xs text-[#4A5568] mb-3">Based on predicted demand for the next 4 hours:</p>
          <div className="space-y-2">
            {[
              { text: "Current staffing adequate until 15:00", type: "good" },
              { text: "Add 1 technician at 15:00 — predicted queue will exceed 30", type: "action" },
              { text: "Consider early break for M. Chen before 14:30 peak", type: "suggestion" },
            ].map((rec, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-md p-3">
                <span className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  rec.type === "good" ? "bg-green-500" :
                  rec.type === "action" ? "bg-[#D69E2E]" :
                  "bg-[#005EB8]"
                )} />
                <p className="text-xs text-[#4A5568]">{rec.text}</p>
              </div>
            ))}
          </div>

          {/* Optimal Schedule */}
          <div className="mt-4 bg-white rounded-md p-3">
            <h4 className="text-xs font-semibold text-[#2B2B2B] mb-2">Recommended Staffing Schedule</h4>
            <div className="grid grid-cols-6 gap-2">
              {["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((hour) => (
                <div key={hour} className="text-center p-2 rounded bg-[#F4F6F8]">
                  <p className="text-[10px] text-[#718096]">{hour}</p>
                  <p className="text-sm font-bold text-[#2B2B2B]">{hour === "15:00" || hour === "16:00" ? 7 : 6}</p>
                  <p className="text-[10px] text-[#718096]">staff</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
