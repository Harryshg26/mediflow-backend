import { getDb } from "../api/queries/connection";
import {
  patients,
  staff,
  prescriptions,
  queueEntries,
  stockItems,
  alerts,
  aiAgentLogs,
  dailyMetrics,
  settings,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Starting seed...");

  // Clear existing data in reverse dependency order
  await db.delete(dailyMetrics);
  await db.delete(aiAgentLogs);
  await db.delete(alerts);
  await db.delete(queueEntries);
  await db.delete(prescriptions);
  await db.delete(stockItems);
  await db.delete(staff);
  await db.delete(patients);
  await db.delete(settings);
  console.log("Cleared existing data");

  // Settings
  await db.insert(settings).values({
    hospitalName: "St Thomas' Hospital",
    pharmacyName: "Outpatient Pharmacy",
    targetWaitTime: 15,
    amberThreshold: 30,
    redThreshold: 45,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "20:00",
    aiAgentEnabled: true,
    aiOptimizationLevel: "balanced",
    autoQueueReorder: true,
    autoStaffSuggestions: true,
    autoPatientNotifications: true,
    notificationThreshold: 30,
  });
  console.log("Settings seeded");

  // Staff
  const staffData = [
    { name: "Dr. Sarah Williams", role: "pharmacist" as const, email: "s.williams@nhs.net", status: "active" as const, currentTask: "Clinical check — RX-08914", prescriptionsHandled: 24, avgProcessingTime: 12 },
    { name: "Kofi Okafor", role: "technician" as const, email: "k.okafor@nhs.net", status: "active" as const, currentTask: "Dispensing — RX-08913", prescriptionsHandled: 31, avgProcessingTime: 8 },
    { name: "Dr. Priya Patel", role: "pharmacist" as const, email: "p.patel@nhs.net", status: "active" as const, currentTask: "Verifying discharge meds", prescriptionsHandled: 19, avgProcessingTime: 15 },
    { name: "Mei Lin Chen", role: "technician" as const, email: "m.chen@nhs.net", status: "onbreak" as const, currentTask: null, prescriptionsHandled: 28, avgProcessingTime: 9 },
    { name: "James Henderson", role: "technician" as const, email: "j.henderson@nhs.net", status: "active" as const, currentTask: "Labelling — RX-08915", prescriptionsHandled: 22, avgProcessingTime: 10 },
    { name: "Aisha Rahman", role: "manager" as const, email: "a.rahman@nhs.net", status: "active" as const, currentTask: "Reviewing AI recommendations", prescriptionsHandled: 0, avgProcessingTime: null },
  ];
  await db.insert(staff).values(staffData);
  const staffList = await db.select().from(staff);
  console.log("Staff seeded:", staffList.length);

  // Patients
  const patientData = [
    { mrn: "445291", name: "Jane Smith", dateOfBirth: "1947-03-15", allergies: "Penicillin", contactPhone: "07700 900123" },
    { mrn: "892134", name: "Amit Patel", dateOfBirth: "1965-08-22", allergies: null, contactPhone: "07700 900456" },
    { mrn: "671023", name: "Lisa Chen", dateOfBirth: "1982-11-03", allergies: "Sulphonamides", contactPhone: "07700 900789" },
    { mrn: "345876", name: "Robert Jones", dateOfBirth: "1950-06-10", allergies: null, contactPhone: "07700 900321" },
    { mrn: "908712", name: "Maria Garcia", dateOfBirth: "1975-01-28", allergies: "Aspirin, NSAIDs", contactPhone: "07700 900654" },
    { mrn: "123567", name: "David O'Connor", dateOfBirth: "1990-09-14", allergies: null, contactPhone: "07700 900987" },
    { mrn: "784321", name: "Fatima Al-Hassan", dateOfBirth: "1958-04-20", allergies: "Codeine", contactPhone: "07700 900147" },
    { mrn: "556789", name: "William Thompson", dateOfBirth: "1942-12-01", allergies: null, contactPhone: "07700 900258" },
    { mrn: "334455", name: "Emily Watson", dateOfBirth: "1988-07-17", allergies: "Latex", contactPhone: "07700 900369" },
    { mrn: "998877", name: "Mohammed Khan", dateOfBirth: "1970-02-25", allergies: null, contactPhone: "07700 900741" },
    { mrn: "112233", name: "Susan Brown", dateOfBirth: "1960-10-08", allergies: "Metformin", contactPhone: "07700 900852" },
    { mrn: "776655", name: "James Wilson", dateOfBirth: "1995-05-30", allergies: null, contactPhone: "07700 900963" },
    { mrn: "443322", name: "Anna Kowalski", dateOfBirth: "1953-08-12", allergies: "Penicillin, Erythromycin", contactPhone: "07700 900159" },
    { mrn: "667788", name: "John Taylor", dateOfBirth: "1980-03-22", allergies: null, contactPhone: "07700 900357" },
    { mrn: "223344", name: "Sofia Andersson", dateOfBirth: "1992-11-18", allergies: "Iodine", contactPhone: "07700 900486" },
    { mrn: "554433", name: "George Davies", dateOfBirth: "1948-07-05", allergies: null, contactPhone: "07700 900951" },
    { mrn: "887766", name: "Olivia Martin", dateOfBirth: "1978-01-14", allergies: "Sulfa drugs", contactPhone: "07700 900753" },
    { mrn: "336699", name: "Liam Murphy", dateOfBirth: "2001-09-09", allergies: null, contactPhone: "07700 900357" },
    { mrn: "774422", name: "Isabella Rossi", dateOfBirth: "1967-04-28", allergies: "Penicillin", contactPhone: "07700 900468" },
    { mrn: "229988", name: "Noah Anderson", dateOfBirth: "1955-12-19", allergies: null, contactPhone: "07700 900159" },
  ];
  await db.insert(patients).values(patientData);
  const patientList = await db.select().from(patients);
  console.log("Patients seeded:", patientList.length);

  const p = (mrn: string) => patientList.find(pp => pp.mrn === mrn)!.id;

  // Simpler prescriptions - fewer fields to avoid packet issues
  const today = new Date();
  const rxData = [
    { prescriptionId: "RX-2026-08912", patientId: p("445291"), prescriberName: "Dr. Helen Moore", source: "outpatient" as const, urgency: "standard" as const, status: "ready" as const, items: 4, keyDrug: "Amoxicillin 500mg", clinicalNotes: "Respiratory infection — 7 day course", collectionMethod: "walkin" as const, assignedTo: staffList[0].id, aiPriority: "urgent" as const, aiPriorityReason: "Age 78, waiting 42min", aiConfidence: "95.00" },
    { prescriptionId: "RX-2026-08913", patientId: p("892134"), prescriberName: "Dr. James Liu", source: "outpatient" as const, urgency: "standard" as const, status: "dispensing" as const, items: 2, keyDrug: "Insulin Glargine", clinicalNotes: "Diabetes management — monthly supply", collectionMethod: "carpark" as const, assignedTo: staffList[1].id, aiPriority: "high" as const, aiPriorityReason: "Temperature-sensitive insulin", aiConfidence: "92.00" },
    { prescriptionId: "RX-2026-08914", patientId: p("671023"), prescriberName: "Dr. Sarah Williams", source: "discharge" as const, urgency: "urgent" as const, status: "checking" as const, items: 6, keyDrug: "Warfarin 5mg", clinicalNotes: "DVT — INR 3.2, reduce dose", collectionMethod: "ward" as const, assignedTo: staffList[0].id, aiPriority: "urgent" as const, aiPriorityReason: "6 items, 3 drug interactions flagged", aiConfidence: "98.00" },
    { prescriptionId: "RX-2026-08915", patientId: p("345876"), prescriberName: "Dr. Michael Brown", source: "outpatient" as const, urgency: "standard" as const, status: "dispensing" as const, items: 1, keyDrug: "Salbutamol inhaler", clinicalNotes: "Asthma — routine repeat", collectionMethod: "walkin" as const, assignedTo: staffList[4].id, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08916", patientId: p("908712"), prescriberName: "Dr. Priya Patel", source: "outpatient" as const, urgency: "standard" as const, status: "ready" as const, items: 3, keyDrug: "Amlodipine 5mg", clinicalNotes: "Hypertension — 28 day supply", collectionMethod: "locker" as const, assignedTo: staffList[2].id, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08917", patientId: p("123567"), prescriberName: "Dr. Helen Moore", source: "ae" as const, urgency: "stat" as const, status: "dispensing" as const, items: 2, keyDrug: "Co-amoxiclav 625mg", clinicalNotes: "Cellulitis — STAT dose required", collectionMethod: "walkin" as const, assignedTo: staffList[1].id, aiPriority: "urgent" as const, aiPriorityReason: "STAT priority from A&E", aiConfidence: "99.00" },
    { prescriptionId: "RX-2026-08918", patientId: p("784321"), prescriberName: "Dr. James Liu", source: "clinic" as const, urgency: "standard" as const, status: "ready" as const, items: 2, keyDrug: "Levothyroxine 100mcg", clinicalNotes: "Hypothyroidism — 3 month supply", collectionMethod: "carpark" as const, assignedTo: staffList[2].id, aiPriority: "low" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08919", patientId: p("556789"), prescriberName: "Dr. Michael Brown", source: "outpatient" as const, urgency: "standard" as const, status: "checking" as const, items: 5, keyDrug: "Furosemide 40mg", clinicalNotes: "CHF — check renal function", collectionMethod: "walkin" as const, assignedTo: staffList[0].id, aiPriority: "high" as const, aiPriorityReason: "5 items, elderly patient age 82", aiConfidence: "89.00" },
    { prescriptionId: "RX-2026-08920", patientId: p("334455"), prescriberName: "Dr. Sarah Williams", source: "outpatient" as const, urgency: "standard" as const, status: "ready" as const, items: 1, keyDrug: "Cetirizine 10mg", clinicalNotes: "Allergic rhinitis", collectionMethod: "walkin" as const, assignedTo: staffList[4].id, aiPriority: "low" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08921", patientId: p("998877"), prescriberName: "Dr. Priya Patel", source: "discharge" as const, urgency: "urgent" as const, status: "dispensing" as const, items: 4, keyDrug: "Metformin 500mg", clinicalNotes: "T2DM discharge — continue current regimen", collectionMethod: "carpark" as const, assignedTo: staffList[1].id, aiPriority: "high" as const, aiPriorityReason: "Discharge — patient waiting in car park", aiConfidence: "94.00" },
    { prescriptionId: "RX-2026-08922", patientId: p("112233"), prescriberName: "Dr. James Liu", source: "outpatient" as const, urgency: "standard" as const, status: "received" as const, items: 2, keyDrug: "Atorvastatin 20mg", clinicalNotes: "Hyperlipidaemia — routine repeat", collectionMethod: "walkin" as const, assignedTo: null, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08923", patientId: p("776655"), prescriberName: "Dr. Helen Moore", source: "outpatient" as const, urgency: "standard" as const, status: "received" as const, items: 3, keyDrug: "Bisoprolol 5mg", clinicalNotes: "Hypertension — new dose", collectionMethod: "walkin" as const, assignedTo: null, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08924", patientId: p("443322"), prescriberName: "Dr. Michael Brown", source: "clinic" as const, urgency: "standard" as const, status: "checking" as const, items: 1, keyDrug: "Clarithromycin 500mg", clinicalNotes: "Chest infection — penicillin allergy noted", collectionMethod: "walkin" as const, assignedTo: staffList[2].id, aiPriority: "high" as const, aiPriorityReason: "Penicillin allergy — verify antibiotic choice", aiConfidence: "91.00" },
    { prescriptionId: "RX-2026-08925", patientId: p("667788"), prescriberName: "Dr. Sarah Williams", source: "outpatient" as const, urgency: "standard" as const, status: "ready" as const, items: 2, keyDrug: "Omeprazole 20mg", clinicalNotes: "GERD — 28 day supply", collectionMethod: "locker" as const, assignedTo: staffList[4].id, aiPriority: "low" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08926", patientId: p("223344"), prescriberName: "Dr. Priya Patel", source: "ae" as const, urgency: "urgent" as const, status: "received" as const, items: 3, keyDrug: "Prednisolone 5mg", clinicalNotes: "Acute asthma exacerbation", collectionMethod: "walkin" as const, assignedTo: null, aiPriority: "high" as const, aiPriorityReason: "Respiratory — priority from A&E", aiConfidence: "93.00" },
    { prescriptionId: "RX-2026-08927", patientId: p("554433"), prescriberName: "Dr. James Liu", source: "outpatient" as const, urgency: "standard" as const, status: "dispensing" as const, items: 2, keyDrug: "Gabapentin 300mg", clinicalNotes: "Neuropathic pain — titrating dose", collectionMethod: "walkin" as const, assignedTo: staffList[1].id, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08928", patientId: p("887766"), prescriberName: "Dr. Helen Moore", source: "discharge" as const, urgency: "standard" as const, status: "dispensing" as const, items: 4, keyDrug: "Apixaban 5mg", clinicalNotes: "AF — bridge therapy post-procedure", collectionMethod: "ward" as const, assignedTo: staffList[0].id, aiPriority: "high" as const, aiPriorityReason: "Anticoagulant — discharge timing critical", aiConfidence: "90.00" },
    { prescriptionId: "RX-2026-08929", patientId: p("336699"), prescriberName: "Dr. Michael Brown", source: "outpatient" as const, urgency: "standard" as const, status: "received" as const, items: 1, keyDrug: "Fluoxetine 20mg", clinicalNotes: "Depression — first prescription", collectionMethod: "walkin" as const, assignedTo: null, aiPriority: "low" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08930", patientId: p("774422"), prescriberName: "Dr. Sarah Williams", source: "outpatient" as const, urgency: "standard" as const, status: "ready" as const, items: 2, keyDrug: "Lisinopril 10mg", clinicalNotes: "Hypertension — renal monitoring", collectionMethod: "carpark" as const, assignedTo: staffList[2].id, aiPriority: "medium" as const, aiPriorityReason: null, aiConfidence: null },
    { prescriptionId: "RX-2026-08931", patientId: p("229988"), prescriberName: "Dr. Priya Patel", source: "clinic" as const, urgency: "standard" as const, status: "checking" as const, items: 3, keyDrug: "Methotrexate 10mg", clinicalNotes: "RA — weekly dose, FBC required", collectionMethod: "walkin" as const, assignedTo: staffList[0].id, aiPriority: "high" as const, aiPriorityReason: "DMARD — requires blood result check", aiConfidence: "96.00" },
  ];

  // Insert prescriptions in small batches
  for (const rx of rxData) {
    await db.insert(prescriptions).values(rx);
  }
  const rxList = await db.select().from(prescriptions);
  console.log("Prescriptions seeded:", rxList.length);

  const rxi = (pid: string) => rxList.find(r => r.prescriptionId === pid)!.id;

  // Queue Entries
  const queueData = [
    { prescriptionId: rxi("RX-2026-08912"), queueNumber: "Q-1284", position: 1, previousPosition: 3, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08913"), queueNumber: "Q-1285", position: 2, previousPosition: 4, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08914"), queueNumber: "Q-1286", position: 3, previousPosition: 8, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08915"), queueNumber: "Q-1287", position: 4, previousPosition: 5, status: "waiting" as const, checkInMethod: "kiosk" as const },
    { prescriptionId: rxi("RX-2026-08916"), queueNumber: "Q-1288", position: 5, previousPosition: 6, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08917"), queueNumber: "Q-1289", position: 6, previousPosition: 10, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08918"), queueNumber: "Q-1290", position: 7, previousPosition: 7, status: "waiting" as const, checkInMethod: "auto" as const },
    { prescriptionId: rxi("RX-2026-08919"), queueNumber: "Q-1291", position: 8, previousPosition: 9, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08920"), queueNumber: "Q-1292", position: 9, previousPosition: 2, status: "waiting" as const, checkInMethod: "kiosk" as const },
    { prescriptionId: rxi("RX-2026-08921"), queueNumber: "Q-1293", position: 10, previousPosition: 11, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08922"), queueNumber: "Q-1294", position: 11, previousPosition: 12, status: "waiting" as const, checkInMethod: "kiosk" as const },
    { prescriptionId: rxi("RX-2026-08923"), queueNumber: "Q-1295", position: 12, previousPosition: 13, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08924"), queueNumber: "Q-1296", position: 13, previousPosition: 15, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08925"), queueNumber: "Q-1297", position: 14, previousPosition: 14, status: "waiting" as const, checkInMethod: "auto" as const },
    { prescriptionId: rxi("RX-2026-08926"), queueNumber: "Q-1298", position: 15, previousPosition: 18, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08927"), queueNumber: "Q-1299", position: 16, previousPosition: 16, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08928"), queueNumber: "Q-1300", position: 17, previousPosition: 19, status: "waiting" as const, checkInMethod: "staff" as const },
    { prescriptionId: rxi("RX-2026-08929"), queueNumber: "Q-1301", position: 18, previousPosition: 20, status: "waiting" as const, checkInMethod: "kiosk" as const },
    { prescriptionId: rxi("RX-2026-08930"), queueNumber: "Q-1302", position: 19, previousPosition: 17, status: "waiting" as const, checkInMethod: "auto" as const },
    { prescriptionId: rxi("RX-2026-08931"), queueNumber: "Q-1303", position: 20, previousPosition: 21, status: "waiting" as const, checkInMethod: "staff" as const },
  ];
  await db.insert(queueEntries).values(queueData);
  console.log("Queue entries seeded");

  // Stock Items
  const stockData = [
    { drugName: "Amoxicillin", strength: "500mg", form: "Capsules", currentStock: 8, reorderPoint: 15, maxStock: 100, unit: "packs", supplier: "Aurobindo Pharma", status: "critical" as const, aiPredictedRunout: "2026-05-05", aiPredictedDemand: 45 },
    { drugName: "Metformin", strength: "500mg", form: "Tablets", currentStock: 12, reorderPoint: 20, maxStock: 150, unit: "packs", supplier: "Merck", status: "critical" as const, aiPredictedRunout: "2026-05-04", aiPredictedDemand: 60 },
    { drugName: "Atorvastatin", strength: "20mg", form: "Tablets", currentStock: 45, reorderPoint: 25, maxStock: 120, unit: "packs", supplier: "Pfizer", status: "normal" as const, aiPredictedRunout: null, aiPredictedDemand: 30 },
    { drugName: "Amlodipine", strength: "5mg", form: "Tablets", currentStock: 38, reorderPoint: 20, maxStock: 100, unit: "packs", supplier: "Pfizer", status: "normal" as const, aiPredictedRunout: null, aiPredictedDemand: 25 },
    { drugName: "Salbutamol", strength: "100mcg", form: "Inhaler", currentStock: 15, reorderPoint: 20, maxStock: 80, unit: "inhalers", supplier: "GSK", status: "low" as const, aiPredictedRunout: "2026-05-08", aiPredictedDemand: 35 },
    { drugName: "Paracetamol", strength: "500mg", form: "Tablets", currentStock: 120, reorderPoint: 50, maxStock: 200, unit: "packs", supplier: "Reckitt", status: "normal" as const, aiPredictedRunout: null, aiPredictedDemand: 80 },
    { drugName: "Furosemide", strength: "40mg", form: "Tablets", currentStock: 6, reorderPoint: 15, maxStock: 60, unit: "packs", supplier: "Sanofi", status: "critical" as const, aiPredictedRunout: "2026-05-03", aiPredictedDemand: 28 },
    { drugName: "Co-amoxiclav", strength: "625mg", form: "Tablets", currentStock: 3, reorderPoint: 10, maxStock: 50, unit: "packs", supplier: "GSK", status: "out_of_stock" as const, aiPredictedRunout: "2026-05-02", aiPredictedDemand: 25 },
    { drugName: "Apixaban", strength: "5mg", form: "Tablets", currentStock: 14, reorderPoint: 15, maxStock: 50, unit: "packs", supplier: "Bristol-Myers", status: "low" as const, aiPredictedRunout: "2026-05-07", aiPredictedDemand: 20 },
    { drugName: "Methotrexate", strength: "10mg", form: "Tablets", currentStock: 9, reorderPoint: 10, maxStock: 40, unit: "packs", supplier: "Pfizer", status: "low" as const, aiPredictedRunout: "2026-05-06", aiPredictedDemand: 12 },
  ];
  await db.insert(stockItems).values(stockData);
  console.log("Stock items seeded");

  // Alerts
  const alertData = [
    { type: "critical" as const, title: "Patient waiting 52 minutes", message: "Patient Q-1281 (Jane Smith, MRN: 445291) has been waiting 52 minutes for Amoxicillin prescription. Medication is ready but patient has not collected.", relatedEntity: "prescription" as const, relatedId: rxi("RX-2026-08912"), isRead: false },
    { type: "warning" as const, title: "Stock alert: Metformin running low", message: "Only 12 packs of Metformin 500mg remaining. Reorder point is 20 packs. AI predicts stock will run out in 2 days.", relatedEntity: "stock" as const, isRead: false },
    { type: "info" as const, title: "AI reordered queue", message: "AI agent moved 2 discharge prescriptions to front of queue — patients waiting in car park.", relatedEntity: "system" as const, isRead: false },
    { type: "success" as const, title: "Batch dispense complete", message: "8 discharge prescriptions batch-dispensed. Average processing time: 6.3 minutes.", relatedEntity: "prescription" as const, isRead: false },
    { type: "warning" as const, title: "Stock alert: Furosemide critical", message: "Furosemide 40mg stock critical — only 6 packs remaining. AI predicts runout by end of day.", relatedEntity: "stock" as const, isRead: false },
    { type: "critical" as const, title: "Co-amoxiclav out of stock", message: "Co-amoxiclav 625mg is out of stock. 2 pending prescriptions require this medication.", relatedEntity: "stock" as const, isRead: false },
    { type: "info" as const, title: "AI staffing suggestion", message: "AI predicts patient surge at 15:30. Recommend adding 1 dispenser for 15:00-17:00 shift.", relatedEntity: "system" as const, isRead: false },
    { type: "success" as const, title: "Priority dispense completed", message: "STAT prescription for A&E patient dispensed in 8 minutes — exceeding 15-minute target.", relatedEntity: "prescription" as const, isRead: false },
  ];
  await db.insert(alerts).values(alertData);
  console.log("Alerts seeded");

  // AI Agent Logs
  const aiLogData = [
    { action: "queue_reorder" as const, description: "Moved 3 discharge prescriptions to front of queue — patients waiting in car park", confidence: "94.00", wasAccepted: true, timeSaved: 18 },
    { action: "priority_flag" as const, description: "Flagged prescription RX-08914 as URGENT — 6 items with 3 potential drug interactions", confidence: "98.00", wasAccepted: true, timeSaved: 12 },
    { action: "staff_suggest" as const, description: "Suggested assigning complex prescription to Senior Pharmacist Dr. Williams", confidence: "89.00", wasAccepted: true, timeSaved: 8 },
    { action: "stock_alert" as const, description: "Predicted Metformin 500mg stock depletion in 2 days", confidence: "92.00", wasAccepted: false, timeSaved: null },
    { action: "patient_notify" as const, description: "Auto-sent SMS to patient in car park — prescription ready for collection", confidence: "99.00", wasAccepted: true, timeSaved: 5 },
    { action: "queue_reorder" as const, description: "Prioritised STAT prescription from A&E — moved to position 1 in dispensing queue", confidence: "99.00", wasAccepted: true, timeSaved: 15 },
    { action: "priority_flag" as const, description: "Flagged elderly patient (age 82) prescription for expedited review", confidence: "87.00", wasAccepted: true, timeSaved: 10 },
    { action: "staff_suggest" as const, description: "Recommended technician K. Okafor for insulin dispensing — trained on cold-chain", confidence: "95.00", wasAccepted: true, timeSaved: 7 },
    { action: "stock_alert" as const, description: "Predicted Amoxicillin demand increase of 40% next week", confidence: "85.00", wasAccepted: true, timeSaved: null },
    { action: "queue_reorder" as const, description: "Batch-optimised 4 Amoxicillin prescriptions — same drug, same shelf location", confidence: "91.00", wasAccepted: true, timeSaved: 12 },
    { action: "patient_notify" as const, description: "Sent reminder to patient waiting 35+ minutes", confidence: "96.00", wasAccepted: true, timeSaved: 3 },
    { action: "staff_suggest" as const, description: "Suggested early break for M. Chen before predicted 14:30 peak", confidence: "82.00", wasAccepted: false, timeSaved: null },
    { action: "priority_flag" as const, description: "Auto-flagged penicillin allergy on Clarithromycin prescription", confidence: "91.00", wasAccepted: true, timeSaved: 8 },
    { action: "queue_reorder" as const, description: "Moved car park collection prescriptions to priority", confidence: "93.00", wasAccepted: true, timeSaved: 14 },
    { action: "stock_alert" as const, description: "Predicted Furosemide stockout by end of day", confidence: "97.00", wasAccepted: true, timeSaved: null },
    { action: "patient_notify" as const, description: "Auto-SMS sent: prescription ready in locker for collection", confidence: "99.00", wasAccepted: true, timeSaved: 4 },
    { action: "staff_suggest" as const, description: "Recommend additional dispenser for Tuesday 15:00-17:00", confidence: "91.00", wasAccepted: null, timeSaved: null },
    { action: "queue_reorder" as const, description: "AI-optimised queue for 3 temperature-sensitive items — insulin prioritised", confidence: "96.00", wasAccepted: true, timeSaved: 9 },
    { action: "priority_flag" as const, description: "DMARD prescription flagged — requires recent blood result verification", confidence: "96.00", wasAccepted: true, timeSaved: 11 },
    { action: "stock_alert" as const, description: "Detected Apixaban running low — 14 packs remaining, 5-day supply", confidence: "88.00", wasAccepted: false, timeSaved: null },
  ];
  await db.insert(aiAgentLogs).values(aiLogData);
  console.log("AI logs seeded");

  // Daily Metrics
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const aiActive = i <= 15;
    const factor = aiActive ? 0.65 + (15 - i) * 0.015 : 1.0;
    
    await db.insert(dailyMetrics).values({
      date: dateStr,
      totalPrescriptions: Math.floor((120 + Math.random() * 40) * (aiActive ? 1.15 : 1.0)),
      totalCollected: Math.floor((115 + Math.random() * 35) * (aiActive ? 1.15 : 1.0)),
      avgWaitTime: Math.floor((28 * factor) + Math.random() * 5),
      maxWaitTime: Math.floor((55 * factor) + Math.random() * 15),
      patientsWaitingPeak: Math.floor((38 * factor) + Math.random() * 8),
      aiTasksCompleted: aiActive ? Math.floor(20 + Math.random() * 30) : 0,
      aiAccuracy: aiActive ? (85 + Math.random() * 12).toFixed(2) : null,
      staffHours: (42 + Math.random() * 6).toFixed(2),
    });
  }
  console.log("Daily metrics seeded");

  console.log("Seed complete!");
}

seed().catch(e => {
  console.error("Seed error:", e);
  process.exit(1);
});
