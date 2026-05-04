import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Search,
  Download,
  X,
  Pill,
  User,
  Stethoscope,
  Package,
  Clock,
  AlertTriangle,
  Printer,
  MessageSquare,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  received: "bg-[#E2E8F0] text-[#4A5568]",
  checking: "bg-[#FEFCBF] text-[#D69E2E]",
  dispensing: "bg-[#DBEAFE] text-[#005EB8]",
  ready: "bg-[#C6F6D5] text-[#1A6B4D]",
  collected: "bg-[#E2E8F0] text-[#718096]",
};

export default function Prescriptions() {
  const { data: prescriptions } = trpc.prescription.list.useQuery({ limit: 50 });
  const { data: patients } = trpc.patient.list.useQuery();
  const { data: staffList } = trpc.staff.list.useQuery();
  const [selectedRx, setSelectedRx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: rxDetail } = trpc.prescription.getById.useQuery(
    { id: selectedRx! },
    { enabled: !!selectedRx }
  );
  void rxDetail;

  const filteredPrescriptions = prescriptions?.filter((rx) => {
    if (statusFilter && rx.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rx.prescriptionId.toLowerCase().includes(q) ||
        rx.keyDrug?.toLowerCase().includes(q) ||
        rx.prescriberName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2B2B]">Prescriptions</h1>
            <p className="text-sm text-[#718096] mt-0.5">Search, filter, and manage all prescriptions</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#F4F6F8] rounded-md text-sm text-[#4A5568] hover:bg-[#E4E6E8] transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, prescription ID, drug name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F4F6F8] rounded-md border-0 focus:ring-2 focus:ring-[#005EB8]/25"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#F4F6F8] rounded-md border-0 focus:ring-2 focus:ring-[#005EB8]/25"
          >
            <option value="">All Status</option>
            <option value="received">Received</option>
            <option value="checking">Clinical Check</option>
            <option value="dispensing">Dispensing</option>
            <option value="ready">Ready</option>
            <option value="collected">Collected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8]">
                {["Prescription ID", "Patient", "Date/Time", "Status", "Items", "Priority", "Assigned To", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions?.map((rx) => {
                const patient = patients?.find((p) => p.id === rx.patientId);
                const assigned = staffList?.find((s) => s.id === rx.assignedTo);
                return (
                  <tr
                    key={rx.id}
                    className="border-b border-[#F4F6F8] hover:bg-[rgba(0,0,0,0.02)] transition-colors cursor-pointer"
                    onClick={() => setSelectedRx(rx.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-[#005EB8]">{rx.prescriptionId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#005EB8]/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-[#005EB8]" />
                        </div>
                        <span className="text-xs text-[#2B2B2B]">{patient?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">
                      {rx.receivedAt ? new Date(rx.receivedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[rx.status])}>
                        {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Pill className="w-3 h-3 text-[#718096]" />
                        <span className="text-xs text-[#4A5568]">{rx.items}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        rx.aiPriority === "urgent" ? "bg-[#FED7D7] text-[#C53030]" :
                        rx.aiPriority === "high" ? "bg-[#FEFCBF] text-[#D69E2E]" :
                        rx.aiPriority === "medium" ? "bg-[#DBEAFE] text-[#005EB8]" :
                        "bg-[#E2E8F0] text-[#718096]"
                      )}>
                        {rx.aiPriority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">{assigned?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-[#005EB8] hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      {selectedRx && rxDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedRx(null)} />
          <div className="relative w-[480px] h-full bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E4E6E8] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2B2B2B]">{rxDetail.prescriptionId}</h2>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[rxDetail.status])}>
                  {rxDetail.status.charAt(0).toUpperCase() + rxDetail.status.slice(1)}
                </span>
              </div>
              <button onClick={() => setSelectedRx(null)} className="p-2 rounded-md hover:bg-[#F4F6F8]">
                <X className="w-5 h-5 text-[#718096]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Card */}
              <div className="bg-[#F4F6F8] rounded-lg p-4">
                <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Patient</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005EB8]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#005EB8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2B2B2B]">{rxDetail.patient?.name}</p>
                    <p className="text-xs text-[#718096] font-mono">MRN: {rxDetail.patient?.mrn}</p>
                    <p className="text-xs text-[#718096]">DOB: {rxDetail.patient?.dateOfBirth ? new Date(rxDetail.patient.dateOfBirth).toLocaleDateString("en-GB") : "—"}</p>
                  </div>
                </div>
                {rxDetail.patient?.allergies && (
                  <div className="mt-2 flex items-center gap-1 text-[#C53030]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Allergies: {rxDetail.patient.allergies}</span>
                  </div>
                )}
              </div>

              {/* Medication List */}
              <div>
                <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Medications</h3>
                <div className="space-y-2">
                  {[
                    { name: rxDetail.keyDrug, strength: "See details", dispensed: rxDetail.status === "ready" || rxDetail.status === "collected" },
                    { name: "Supporting medications", strength: `${rxDetail.items - 1} additional items`, dispensed: rxDetail.status === "collected" },
                  ].map((med, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-[#E4E6E8]">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        med.dispensed ? "bg-[#C6F6D5]" : "bg-[#FEFCBF]"
                      )}>
                        {med.dispensed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1A6B4D]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#D69E2E]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2B2B2B]">{med.name}</p>
                        <p className="text-xs text-[#718096]">{med.strength}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Clinical Notes</h3>
                <div className="bg-[#FFFBEB] rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-[#D69E2E] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#4A5568]">{rxDetail.clinicalNotes || "No clinical notes recorded."}</p>
                  </div>
                </div>
              </div>

              {/* Prescriber */}
              <div>
                <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Prescriber</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#005EB8]/10 flex items-center justify-center">
                    <Stethoscope className="w-3 h-3 text-[#005EB8]" />
                  </div>
                  <span className="text-sm text-[#2B2B2B]">{rxDetail.prescriberName}</span>
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">Audit Trail</h3>
                <div className="space-y-2">
                  {[
                    { time: rxDetail.receivedAt, label: "Received", icon: Package },
                    { time: rxDetail.checkingAt, label: "Clinical Check Started", icon: Stethoscope },
                    { time: rxDetail.dispensingAt, label: "Dispensing Started", icon: Pill },
                    { time: rxDetail.readyAt, label: "Ready for Collection", icon: CheckCircle2 },
                    { time: rxDetail.collectedAt, label: "Collected", icon: Package },
                  ].filter((t) => t.time).map((trail, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <trail.icon className="w-3.5 h-3.5 text-[#718096]" />
                      <span className="text-[#718096] font-mono">
                        {new Date(trail.time!).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[#4A5568]">{trail.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E4E6E8] space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005EB8] text-white rounded-md text-sm font-medium hover:bg-[#004A94] transition-colors">
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F4F6F8] text-[#4A5568] rounded-md text-sm hover:bg-[#E4E6E8] transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Notify Patient
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F4F6F8] text-[#C53030] rounded-md text-sm hover:bg-[#FED7D7] transition-colors">
                    <Flag className="w-4 h-4" />
                    Flag Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
