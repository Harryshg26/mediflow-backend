import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  PackageCheck,
  Brain,
  Wifi,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Zap,
  Star,
  Plus,
  BarChart3,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ready: "bg-[#C6F6D5] text-[#1A6B4D]",
    dispensing: "bg-[#DBEAFE] text-[#005EB8]",
    checking: "bg-[#FEFCBF] text-[#D69E2E]",
    received: "bg-[#E2E8F0] text-[#4A5568]",
    collected: "bg-[#E2E8F0] text-[#718096]",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", styles[status] || styles.received)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PriorityBadge({ priority, reason }: { priority: string; reason?: string | null }) {
  const styles: Record<string, string> = {
    urgent: "bg-[#FED7D7] text-[#C53030]",
    high: "bg-[#FEFCBF] text-[#D69E2E]",
    medium: "bg-[#DBEAFE] text-[#005EB8]",
    low: "bg-[#E2E8F0] text-[#718096]",
  };
  return (
    <span
      className={cn("px-2 py-0.5 rounded-full text-xs font-medium cursor-help", styles[priority] || styles.medium)}
      title={reason || ""}
    >
      {priority.toUpperCase()}
    </span>
  );
}

function AlertCard({ alert }: { alert: { type: string; title: string; message: string; createdAt: Date } }) {
  const icons = {
    critical: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle2,
  };
  const colors = {
    critical: "border-l-[#C53030] bg-[#FFF5F5]",
    warning: "border-l-[#D69E2E] bg-[#FFFBEB]",
    info: "border-l-[#005EB8] bg-[#EFF6FF]",
    success: "border-l-[#1A6B4D] bg-[#F0FFF4]",
  };
  const Icon = icons[alert.type as keyof typeof icons] || Info;

  return (
    <div className={cn("p-3 rounded-md border-l-4", colors[alert.type as keyof typeof colors] || colors.info)}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2B2B2B]">{alert.title}</p>
          <p className="text-[11px] text-[#4A5568] mt-0.5 line-clamp-2">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: metrics } = trpc.analytics.getDashboardMetrics.useQuery();
  const { data: queueData } = trpc.queue.list.useQuery({ limit: 10 });
  const { data: alertsList } = trpc.alert.list.useQuery({ limit: 8 });
  const { data: hourlyData } = trpc.analytics.getHourlyBreakdown.useQuery();
  const { data: aiStatus } = trpc.ai.getAgentStatus.useQuery();
  void aiStatus;
  const { data: predictions } = trpc.ai.getPredictions.useQuery();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getWaitTimeColor = (minutes: number) => {
    if (minutes > 45) return "text-[#C53030]";
    if (minutes > 30) return "text-[#D69E2E]";
    return "text-[#1A6B4D]";
  };

  const calculateWaitTime = (receivedAt: Date | null) => {
    if (!receivedAt) return 0;
    const diff = currentTime.getTime() - new Date(receivedAt).getTime();
    return Math.floor(diff / 60000);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        {/* Hero Metrics Band */}
        <div
          className="relative rounded-xl p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #E8EDF2 0%, #DDE4EC 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url(/dashboard-hero-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative grid grid-cols-5 gap-6">
            {/* Patients Waiting */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">Current Queue</p>
              <p className={cn("text-5xl font-extrabold tracking-tight", metrics?.patientsWaiting && metrics.patientsWaiting > 20 ? "text-[#C53030]" : "text-[#2B2B2B]")}>
                {metrics?.patientsWaiting ?? "—"}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#D69E2E]" />
                <span className="text-xs text-[#D69E2E]">+3 from 1hr ago</span>
              </div>
            </div>

            {/* Avg Wait Time */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">Average Wait</p>
              <p className="text-5xl font-extrabold text-[#2B2B2B] tracking-tight">
                {metrics?.avgWaitTime ?? "—"}<span className="text-2xl font-semibold ml-1">min</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#718096]">Target: 15min</span>
                <div className="w-20 h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D69E2E] rounded-full transition-all"
                    style={{ width: `${Math.min(((metrics?.avgWaitTime ?? 0) / 15) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Prescriptions Ready */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">Ready for Collection</p>
              <p className="text-5xl font-extrabold text-[#1A6B4D] tracking-tight">
                {metrics?.prescriptionsReady ?? "—"}
              </p>
              <p className="text-xs text-[#1A6B4D]">12 collected in last hour</p>
            </div>

            {/* AI Tasks */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">AI Automations Today</p>
              <p className="text-5xl font-extrabold text-[#005EB8] tracking-tight">
                {metrics?.aiTasksCompleted ?? "—"}
              </p>
              <p className="text-xs text-[#005EB8]">32 queue reorders, 24 priority flags</p>
            </div>

            {/* System Status */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#718096] uppercase tracking-wider">System Status</p>
              <div className="space-y-1.5">
                {[
                  { label: "E-Prescribing", icon: Wifi, status: "connected" },
                  { label: "Stock DB", icon: Database, status: "synced" },
                  { label: "AI Agent", icon: Activity, status: "active" },
                ].map((sys) => (
                  <div key={sys.label} className="flex items-center gap-2">
                    <sys.icon className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-[#2B2B2B]">{sys.label}:</span>
                    <span className="text-xs font-medium text-green-600">{sys.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Queue Status Cards + AI Agent Panel */}
        <div className="grid grid-cols-5 gap-4">
          {/* Status Cards */}
          {[
            { label: "Awaiting Verification", count: 5, color: "#D69E2E", detail: "2 urgent (wait >30min)" },
            { label: "In Dispensing", count: 15, color: "#005EB8", detail: "5 with clinical checks" },
            { label: "Ready for Collection", count: metrics?.prescriptionsReady ?? 47, color: "#1A6B4D", detail: "Est. clear: 2.4hrs" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <p className="text-xs text-[#718096] mb-1">{card.label}</p>
              <p className="text-3xl font-bold" style={{ color: card.color }}>{card.count}</p>
              <p className="text-[11px] text-[#4A5568] mt-1">{card.detail}</p>
            </div>
          ))}

          {/* AI Agent Panel */}
          <div className="col-span-2 rounded-lg p-4 border border-[#1A6B4D]/20"
            style={{ background: "linear-gradient(135deg, rgba(26,107,77,0.08) 0%, rgba(0,94,184,0.04) 100%)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <img src="/ai-agent-avatar.png" alt="AI" className="w-6 h-6 rounded" />
              <span className="text-sm font-semibold text-[#2B2B2B]">AI Queue Agent</span>
              <span className="flex items-center gap-1 text-xs text-[#1A6B4D]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#1A6B4D] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4A5568]">Reordering queue: 3 patients with time-sensitive medications moved to front</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#D69E2E] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4A5568]">Staff reallocation suggested: Move 1 pharmacist to dispensing (predicted surge in 20 min)</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A6B4D] rounded-full" style={{ width: "92%" }} />
                </div>
                <span className="text-[11px] text-[#1A6B4D] font-medium">92% accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Collection Queue + Performance Chart Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Live Queue Table */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4E6E8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#005EB8]" />
                <h3 className="text-sm font-semibold text-[#2B2B2B]">Live Collection Queue</h3>
                <span className="flex items-center gap-1 text-xs text-[#718096]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#718096]">{queueData?.length ?? 0} patients</span>
                <div className="flex gap-1">
                  {["All", "Urgent", "Standard"].map((tab, i) => (
                    <button
                      key={tab}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                        i === 0 ? "bg-[#005EB8] text-white" : "text-[#4A5568] hover:bg-[#F4F6F8]"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F6F8]">
                    {["Queue #", "Patient", "Prescription", "Status", "Wait Time", "AI Priority", "Action"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queueData?.slice(0, 8).map((entry, i) => {
                    const waitMinutes = calculateWaitTime(entry.prescription?.receivedAt ?? null);
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-[#F4F6F8] hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs text-[#4A5568]">{entry.queueNumber}</td>
                        <td className="px-3 py-2.5">
                          <div>
                            <p className="text-xs font-medium text-[#2B2B2B]">{entry.patient?.name}</p>
                            <p className="text-[10px] text-[#718096] font-mono">MRN: {entry.patient?.mrn}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs text-[#4A5568]">{entry.prescription?.keyDrug}</p>
                          <p className="text-[10px] text-[#718096]">{entry.prescription?.items} items</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={entry.prescription?.status ?? "received"} />
                        </td>
                        <td className={cn("px-3 py-2.5 text-xs font-medium", getWaitTimeColor(waitMinutes))}>
                          {waitMinutes} min
                        </td>
                        <td className="px-3 py-2.5">
                          <PriorityBadge
                            priority={entry.prescription?.aiPriority ?? "medium"}
                            reason={entry.prescription?.aiPriorityReason}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {entry.prescription?.status === "ready" ? (
                            <button className="px-2.5 py-1 bg-[#1A6B4D] text-white text-xs rounded-md hover:bg-[#145A3F] transition-colors">
                              Collect
                            </button>
                          ) : (
                            <button className="text-xs text-[#005EB8] hover:underline">View</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chart + Demand Forecast */}
          <div className="space-y-4">
            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#2B2B2B] mb-3">Wait Time vs Volume — Today</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={hourlyData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E8" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#718096" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#718096" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E4E6E8" }}
                  />
                  <ReferenceLine y={15} stroke="#D69E2E" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#D69E2E" }} />
                  <Line type="monotone" dataKey="avgWaitTime" stroke="#C53030" strokeWidth={2} dot={false} name="Wait (min)" />
                  <Bar dataKey="prescriptions" fill="rgba(0,94,184,0.2)" name="Prescriptions" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Demand Forecast */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#1A6B4D]" />
                <h3 className="text-sm font-semibold text-[#2B2B2B]">AI Demand Forecast</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-[#718096] uppercase tracking-wider mb-1">Next 2 Hours</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2B2B2B]">{predictions?.predictedArrivals ?? 18} patients</span>
                    <span className="text-xs text-[#1A6B4D] font-medium">{predictions?.confidence ?? 89}% confidence</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#4A5568]">Suggested: {predictions?.suggestedStaffing ?? 3} dispensers</span>
                    <span className="text-xs text-[#C53030]">(currently {predictions?.currentStaffing ?? 2})</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E4E6E8]">
                  <p className="text-[11px] text-[#718096] uppercase tracking-wider mb-1">Tomorrow</p>
                  <p className="text-sm font-medium text-[#2B2B2B]">{predictions?.tomorrowVolume ?? 142} prescriptions</p>
                  <p className="text-xs text-[#4A5568] mt-1">{predictions?.recommendedPrep ?? "Pre-pack 20 common discharge meds"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts + Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          {/* Active Alerts */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-[#C53030]" />
              <h3 className="text-sm font-semibold text-[#2B2B2B]">Active Alerts</h3>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {alertsList?.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#2B2B2B] mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Priority Dispense", icon: Star, color: "bg-[#1A6B4D] text-white hover:bg-[#145A3F]" },
                { label: "Add Walk-In", icon: Plus, color: "bg-[#005EB8] text-white hover:bg-[#004A94]" },
                { label: "Stock Check", icon: PackageCheck, color: "bg-[#D69E2E] text-white hover:bg-[#B88A1E]" },
                { label: "Generate Report", icon: BarChart3, color: "bg-[#E4E6E8] text-[#4A5568] hover:bg-[#D1D5D9]" },
              ].map((action) => (
                <button
                  key={action.label}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all text-xs font-medium",
                    action.color
                  )}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


