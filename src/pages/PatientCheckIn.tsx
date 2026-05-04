import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";
import {
  Monitor,
  UserCheck,
  Car,
  Hospital,
  Package,
  CheckCircle2,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientCheckIn() {
  const [mode, setMode] = useState<"kiosk" | "staff">("staff");
  const [mrn, setMrn] = useState("");
  const [dob, setDob] = useState("");
  const [collectionMethod, setCollectionMethod] = useState<string>("walkin");
  const [submitted, setSubmitted] = useState(false);
  const [queuePosition, setQueuePosition] = useState(21);

  const checkIn = trpc.queue.checkIn.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setQueuePosition(data.position);
    },
  });
  void checkIn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkIn.mutate({
      patientId: Math.floor(Math.random() * 20) + 1,
      collectionMethod: collectionMethod as any,
    });
  };

  const collectionOptions = [
    { value: "walkin", label: "I'll wait in the pharmacy", icon: Hospital, desc: "Queue at the collection counter" },
    { value: "carpark", label: "I'll wait in my car", icon: Car, desc: "Text me when prescription is ready" },
    { value: "ward", label: "Discharge — send to ward", icon: Package, desc: "Deliver to the patient's ward" },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1440px] mx-auto">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm inline-flex">
            {[
              { key: "staff" as const, label: "Staff Mode", icon: UserCheck },
              { key: "kiosk" as const, label: "Kiosk Mode", icon: Monitor },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setSubmitted(false); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  mode === m.key ? "bg-[#005EB8] text-white" : "text-[#4A5568] hover:bg-[#F4F6F8]"
                )}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {submitted ? (
          /* Success State */
          <div className="max-w-md mx-auto text-center">
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ backgroundImage: "url(/patient-checkin-bg.jpg)", backgroundSize: "cover" }}
            >
              <div className="absolute inset-0 bg-white/90" />
              <div className="relative">
                <div className="w-16 h-16 bg-[#C6F6D5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#1A6B4D]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2">Checked In Successfully</h2>
                <p className="text-sm text-[#4A5568] mb-6">Your prescription has been added to the queue</p>

                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#005EB8]">
                  <Ticket className="w-8 h-8 text-[#005EB8] mx-auto mb-2" />
                  <p className="text-xs text-[#718096] uppercase tracking-wider mb-1">Your Queue Number</p>
                  <p className="text-5xl font-extrabold text-[#005EB8]">Q-{1284 + queuePosition}</p>
                  <div className="mt-4 pt-4 border-t border-[#E4E6E8]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#4A5568]">Position in queue:</span>
                      <span className="font-semibold text-[#2B2B2B]">#{queuePosition}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-[#4A5568]">Estimated wait:</span>
                      <span className="font-semibold text-[#2B2B2B]">~15 minutes</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setSubmitted(false); setMrn(""); setDob(""); }}
                  className="mt-6 px-6 py-2.5 bg-[#005EB8] text-white rounded-md text-sm font-medium hover:bg-[#004A94] transition-colors"
                >
                  Check In Another Patient
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Check-in Form */
          <div className="max-w-lg mx-auto">
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ backgroundImage: "url(/patient-checkin-bg.jpg)", backgroundSize: "cover" }}
            >
              <div className="absolute inset-0 bg-white/95" />
              <div className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-[#2B2B2B]">
                    {mode === "kiosk" ? "Welcome to St Thomas' Hospital Pharmacy" : "Patient Check-In"}
                  </h2>
                  <p className="text-sm text-[#718096] mt-1">
                    {mode === "kiosk" ? "Enter your details to join the queue" : "Register patient for prescription collection"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* MRN Input */}
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">
                      Hospital Number (MRN)
                    </label>
                    <input
                      type="text"
                      value={mrn}
                      onChange={(e) => setMrn(e.target.value)}
                      placeholder="Enter your MRN"
                      className="w-full px-4 py-3 text-lg bg-[#F4F6F8] rounded-lg border-0 focus:ring-2 focus:ring-[#005EB8]/25 placeholder:text-[#718096]"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F4F6F8] rounded-lg border-0 focus:ring-2 focus:ring-[#005EB8]/25"
                      required
                    />
                  </div>

                  {/* Collection Method */}
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-2">
                      How would you like to collect?
                    </label>
                    <div className="space-y-2">
                      {collectionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCollectionMethod(option.value)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                            collectionMethod === option.value
                              ? "border-[#005EB8] bg-[rgba(0,94,184,0.05)]"
                              : "border-[#E4E6E8] hover:border-[#CBD5E0]"
                          )}
                        >
                          <option.icon className={cn(
                            "w-5 h-5 flex-shrink-0",
                            collectionMethod === option.value ? "text-[#005EB8]" : "text-[#718096]"
                          )} />
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              collectionMethod === option.value ? "text-[#005EB8]" : "text-[#2B2B2B]"
                            )}>
                              {option.label}
                            </p>
                            <p className="text-xs text-[#718096]">{option.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Staff-only fields */}
                  {mode === "staff" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Source</label>
                        <select className="w-full px-3 py-2.5 bg-[#F4F6F8] rounded-lg border-0 text-sm">
                          <option>Outpatient</option>
                          <option>Discharge</option>
                          <option>A&E</option>
                          <option>Clinic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4A5568] mb-1.5">Urgency</label>
                        <select className="w-full px-3 py-2.5 bg-[#F4F6F8] rounded-lg border-0 text-sm">
                          <option>Standard</option>
                          <option>Urgent</option>
                          <option>STAT</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={checkIn.isPending}
                    className="w-full py-3.5 bg-[#1A6B4D] text-white rounded-lg text-base font-semibold hover:bg-[#145A3F] transition-colors disabled:opacity-50"
                  >
                    {checkIn.isPending ? "Processing..." : "Join Queue"}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Check-ins */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#2B2B2B] mb-3">Recent Check-ins</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F6F8]">
                    {["Time", "Queue #", "Patient", "Method", "Status"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[11px] font-medium text-[#718096] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: "14:52", qNum: "Q-1284", patient: "Jane Smith", method: "Walk-in", status: "Waiting" },
                    { time: "14:48", qNum: "Q-1285", patient: "Amit Patel", method: "Car park", status: "Waiting" },
                    { time: "14:45", qNum: "Q-1286", patient: "Lisa Chen", method: "Ward", status: "Waiting" },
                    { time: "14:40", qNum: "Q-1283", patient: "Robert Jones", method: "Walk-in", status: "Called" },
                    { time: "14:35", qNum: "Q-1282", patient: "Maria Garcia", method: "Locker", status: "Collected" },
                  ].map((entry, i) => (
                    <tr key={i} className="border-b border-[#F4F6F8]">
                      <td className="px-3 py-2 text-xs text-[#4A5568]">{entry.time}</td>
                      <td className="px-3 py-2 font-mono text-xs text-[#005EB8]">{entry.qNum}</td>
                      <td className="px-3 py-2 text-xs text-[#2B2B2B]">{entry.patient}</td>
                      <td className="px-3 py-2 text-xs text-[#4A5568]">{entry.method}</td>
                      <td className="px-3 py-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                          entry.status === "Waiting" ? "bg-[#DBEAFE] text-[#005EB8]" :
                          entry.status === "Called" ? "bg-[#FEFCBF] text-[#D69E2E]" :
                          "bg-[#C6F6D5] text-[#1A6B4D]"
                        )}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
