import mysql from "mysql2/promise";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL found");
    return;
  }
  
  console.log("Connecting to database...");
  const conn = await mysql.createConnection(url);
  console.log("Connected!");

  // Clear tables
  await conn.execute("DELETE FROM dailyMetrics");
  await conn.execute("DELETE FROM aiAgentLogs");
  await conn.execute("DELETE FROM alerts");
  await conn.execute("DELETE FROM queueEntries");
  await conn.execute("DELETE FROM medications");
  await conn.execute("DELETE FROM prescriptions");
  await conn.execute("DELETE FROM stockItems");
  await conn.execute("DELETE FROM staff");
  await conn.execute("DELETE FROM patients");
  await conn.execute("DELETE FROM settings");
  console.log("Cleared existing data");

  // Settings
  await conn.execute(
    `INSERT INTO settings (hospitalName, pharmacyName, targetWaitTime, amberThreshold, redThreshold, operatingHoursStart, operatingHoursEnd, aiAgentEnabled, aiOptimizationLevel, autoQueueReorder, autoStaffSuggestions, autoPatientNotifications, notificationThreshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["St Thomas' Hospital", "Outpatient Pharmacy", 15, 30, 45, "08:00", "20:00", true, "balanced", true, true, true, 30]
  );

  // Staff
  const staffData = [
    ["Dr. Sarah Williams", "pharmacist", "s.williams@nhs.net", "active", "Clinical check — RX-08914", 24, 12],
    ["Kofi Okafor", "technician", "k.okafor@nhs.net", "active", "Dispensing — RX-08913", 31, 8],
    ["Dr. Priya Patel", "pharmacist", "p.patel@nhs.net", "active", "Verifying discharge meds", 19, 15],
    ["Mei Lin Chen", "technician", "m.chen@nhs.net", "onbreak", null, 28, 9],
    ["James Henderson", "technician", "j.henderson@nhs.net", "active", "Labelling — RX-08915", 22, 10],
    ["Aisha Rahman", "manager", "a.rahman@nhs.net", "active", "Reviewing AI recommendations", 0, null],
  ];
  for (const s of staffData) {
    await conn.execute(`INSERT INTO staff (name, role, email, status, currentTask, prescriptionsHandled, avgProcessingTime) VALUES (?, ?, ?, ?, ?, ?, ?)`, s);
  }
  const [staffRows] = await conn.execute("SELECT id, name FROM staff") as any;

  // Patients
  const patientData = [
    ["445291", "Jane Smith", "1947-03-15", "Penicillin", "07700 900123"],
    ["892134", "Amit Patel", "1965-08-22", null, "07700 900456"],
    ["671023", "Lisa Chen", "1982-11-03", "Sulphonamides", "07700 900789"],
    ["345876", "Robert Jones", "1950-06-10", null, "07700 900321"],
    ["908712", "Maria Garcia", "1975-01-28", "Aspirin, NSAIDs", "07700 900654"],
    ["123567", "David O'Connor", "1990-09-14", null, "07700 900987"],
    ["784321", "Fatima Al-Hassan", "1958-04-20", "Codeine", "07700 900147"],
    ["556789", "William Thompson", "1942-12-01", null, "07700 900258"],
    ["334455", "Emily Watson", "1988-07-17", "Latex", "07700 900369"],
    ["998877", "Mohammed Khan", "1970-02-25", null, "07700 900741"],
    ["112233", "Susan Brown", "1960-10-08", "Metformin", "07700 900852"],
    ["776655", "James Wilson", "1995-05-30", null, "07700 900963"],
    ["443322", "Anna Kowalski", "1953-08-12", "Penicillin, Erythromycin", "07700 900159"],
    ["667788", "John Taylor", "1980-03-22", null, "07700 900357"],
    ["223344", "Sofia Andersson", "1992-11-18", "Iodine", "07700 900486"],
    ["554433", "George Davies", "1948-07-05", null, "07700 900951"],
    ["887766", "Olivia Martin", "1978-01-14", "Sulfa drugs", "07700 900753"],
    ["336699", "Liam Murphy", "2001-09-09", null, "07700 900357"],
    ["774422", "Isabella Rossi", "1967-04-28", "Penicillin", "07700 900468"],
    ["229988", "Noah Anderson", "1955-12-19", null, "07700 900159"],
  ];
  for (const p of patientData) {
    await conn.execute(`INSERT INTO patients (mrn, name, dateOfBirth, allergies, contactPhone) VALUES (?, ?, ?, ?, ?)`, p);
  }
  const [patientRows] = await conn.execute("SELECT id, mrn FROM patients") as any;

  const p = (mrn: string) => patientRows.find((pp: any) => pp.mrn === mrn)?.id;
  const s = (name: string) => staffRows.find((ss: any) => ss.name === name)?.id;

  const today = new Date();
  const td = (h: number, m: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);

  // Prescriptions
  const prescriptions = [
    ["RX-2026-08912", p("445291"), "Dr. Helen Moore", "outpatient", "standard", "ready", 4, "Amoxicillin 500mg", "Respiratory infection — 7 day course", "walkin", s("Dr. Sarah Williams"), "urgent", "Age 78, waiting 42min", 95, td(14,32), td(14,38), td(14,52), td(15,5), null, null],
    ["RX-2026-08913", p("892134"), "Dr. James Liu", "outpatient", "standard", "dispensing", 2, "Insulin Glargine", "Diabetes management — monthly supply", "carpark", s("Kofi Okafor"), "high", "Temperature-sensitive insulin", 92, td(14,45), td(14,50), td(14,58), null, null, null],
    ["RX-2026-08914", p("671023"), "Dr. Sarah Williams", "discharge", "urgent", "checking", 6, "Warfarin 5mg", "DVT — INR 3.2, reduce dose", "ward", s("Dr. Sarah Williams"), "urgent", "6 items, 3 drug interactions flagged", 98, td(14,38), td(14,42), null, null, null, null],
    ["RX-2026-08915", p("345876"), "Dr. Michael Brown", "outpatient", "standard", "dispensing", 1, "Salbutamol inhaler", "Asthma — routine repeat", "walkin", s("James Henderson"), "medium", null, null, td(14,50), td(14,55), td(15,2), null, null, null],
    ["RX-2026-08916", p("908712"), "Dr. Priya Patel", "outpatient", "standard", "ready", 3, "Amlodipine 5mg", "Hypertension — 28 day supply", "locker", s("Dr. Priya Patel"), "medium", null, null, td(14,20), td(14,26), td(14,40), td(14,48), null, null],
    ["RX-2026-08917", p("123567"), "Dr. Helen Moore", "ae", "stat", "dispensing", 2, "Co-amoxiclav 625mg", "Cellulitis — STAT dose required", "walkin", s("Kofi Okafor"), "urgent", "STAT priority from A&E", 99, td(14,55), td(14,57), td(15,1), null, null, null],
    ["RX-2026-08918", p("784321"), "Dr. James Liu", "clinic", "standard", "ready", 2, "Levothyroxine 100mcg", "Hypothyroidism — 3 month supply", "carpark", s("Dr. Priya Patel"), "low", null, null, td(14,15), td(14,22), td(14,35), td(14,42), null, null],
    ["RX-2026-08919", p("556789"), "Dr. Michael Brown", "outpatient", "standard", "checking", 5, "Furosemide 40mg", "CHF — check renal function", "walkin", s("Dr. Sarah Williams"), "high", "5 items, elderly patient age 82", 89, td(14,48), td(14,52), null, null, null, null],
    ["RX-2026-08920", p("334455"), "Dr. Sarah Williams", "outpatient", "standard", "ready", 1, "Cetirizine 10mg", "Allergic rhinitis", "walkin", s("James Henderson"), "low", null, null, td(14,10), td(14,15), td(14,25), td(14,32), null, null],
    ["RX-2026-08921", p("998877"), "Dr. Priya Patel", "discharge", "urgent", "dispensing", 4, "Metformin 500mg", "T2DM discharge — continue current regimen", "carpark", s("Kofi Okafor"), "high", "Discharge — patient waiting in car park", 94, td(14,40), td(14,46), td(14,55), null, null, null],
    ["RX-2026-08922", p("112233"), "Dr. James Liu", "outpatient", "standard", "received", 2, "Atorvastatin 20mg", "Hyperlipidaemia — routine repeat", "walkin", null, "medium", null, null, td(15,5), null, null, null, null, null],
    ["RX-2026-08923", p("776655"), "Dr. Helen Moore", "outpatient", "standard", "received", 3, "Bisoprolol 5mg", "Hypertension — new dose", "walkin", null, "medium", null, null, td(15,8), null, null, null, null, null],
    ["RX-2026-08924", p("443322"), "Dr. Michael Brown", "clinic", "standard", "checking", 1, "Clarithromycin 500mg", "Chest infection — penicillin allergy noted", "walkin", s("Dr. Priya Patel"), "high", "Penicillin allergy — verify antibiotic choice", 91, td(14,35), td(14,41), null, null, null, null],
    ["RX-2026-08925", p("667788"), "Dr. Sarah Williams", "outpatient", "standard", "ready", 2, "Omeprazole 20mg", "GERD — 28 day supply", "locker", s("James Henderson"), "low", null, null, td(14,5), td(14,12), td(14,28), td(14,38), null, null],
    ["RX-2026-08926", p("223344"), "Dr. Priya Patel", "ae", "urgent", "received", 3, "Prednisolone 5mg", "Acute asthma exacerbation", "walkin", null, "high", "Respiratory — priority from A&E", 93, td(15,3), null, null, null, null, null],
    ["RX-2026-08927", p("554433"), "Dr. James Liu", "outpatient", "standard", "dispensing", 2, "Gabapentin 300mg", "Neuropathic pain — titrating dose", "walkin", s("Kofi Okafor"), "medium", null, null, td(14,30), td(14,36), td(14,50), null, null, null],
    ["RX-2026-08928", p("887766"), "Dr. Helen Moore", "discharge", "standard", "dispensing", 4, "Apixaban 5mg", "AF — bridge therapy post-procedure", "ward", s("Dr. Sarah Williams"), "high", "Anticoagulant — discharge timing critical", 90, td(14,25), td(14,33), td(14,45), null, null, null],
    ["RX-2026-08929", p("336699"), "Dr. Michael Brown", "outpatient", "standard", "received", 1, "Fluoxetine 20mg", "Depression — first prescription", "walkin", null, "low", null, null, td(15,10), null, null, null, null, null],
    ["RX-2026-08930", p("774422"), "Dr. Sarah Williams", "outpatient", "standard", "ready", 2, "Lisinopril 10mg", "Hypertension — renal monitoring", "carpark", s("Dr. Priya Patel"), "medium", null, null, td(14,18), td(14,24), td(14,38), td(14,44), null, null],
    ["RX-2026-08931", p("229988"), "Dr. Priya Patel", "clinic", "standard", "checking", 3, "Methotrexate 10mg", "RA — weekly dose, FBC required", "walkin", s("Dr. Sarah Williams"), "high", "DMARD — requires blood result check", 96, td(14,42), td(14,47), null, null, null, null],
  ];

  for (const rx of prescriptions) {
    await conn.execute(
      `INSERT INTO prescriptions (prescriptionId, patientId, prescriberName, source, urgency, status, items, keyDrug, clinicalNotes, collectionMethod, assignedTo, aiPriority, aiPriorityReason, aiConfidence, receivedAt, checkingAt, dispensingAt, readyAt, collectedAt, cancelledAt, waitTimeMinutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      rx
    );
  }
  console.log("Inserted prescriptions");

  // Queue Entries
  const [rxRows] = await conn.execute("SELECT id, prescriptionId FROM prescriptions") as any;
  const rxId = (pid: string) => rxRows.find((r: any) => r.prescriptionId === pid)?.id;

  const queueData = [
    [rxId("RX-2026-08912"), "Q-1284", 1, 3, "waiting", "staff"],
    [rxId("RX-2026-08913"), "Q-1285", 2, 4, "waiting", "staff"],
    [rxId("RX-2026-08914"), "Q-1286", 3, 8, "waiting", "staff"],
    [rxId("RX-2026-08915"), "Q-1287", 4, 5, "waiting", "kiosk"],
    [rxId("RX-2026-08916"), "Q-1288", 5, 6, "waiting", "staff"],
    [rxId("RX-2026-08917"), "Q-1289", 6, 10, "waiting", "staff"],
    [rxId("RX-2026-08918"), "Q-1290", 7, 7, "waiting", "auto"],
    [rxId("RX-2026-08919"), "Q-1291", 8, 9, "waiting", "staff"],
    [rxId("RX-2026-08920"), "Q-1292", 9, 2, "waiting", "kiosk"],
    [rxId("RX-2026-08921"), "Q-1293", 10, 11, "waiting", "staff"],
    [rxId("RX-2026-08922"), "Q-1294", 11, 12, "waiting", "kiosk"],
    [rxId("RX-2026-08923"), "Q-1295", 12, 13, "waiting", "staff"],
    [rxId("RX-2026-08924"), "Q-1296", 13, 15, "waiting", "staff"],
    [rxId("RX-2026-08925"), "Q-1297", 14, 14, "waiting", "auto"],
    [rxId("RX-2026-08926"), "Q-1298", 15, 18, "waiting", "staff"],
    [rxId("RX-2026-08927"), "Q-1299", 16, 16, "waiting", "staff"],
    [rxId("RX-2026-08928"), "Q-1300", 17, 19, "waiting", "staff"],
    [rxId("RX-2026-08929"), "Q-1301", 18, 20, "waiting", "kiosk"],
    [rxId("RX-2026-08930"), "Q-1302", 19, 17, "waiting", "auto"],
    [rxId("RX-2026-08931"), "Q-1303", 20, 21, "waiting", "staff"],
  ];

  for (const q of queueData) {
    await conn.execute(`INSERT INTO queueEntries (prescriptionId, queueNumber, position, previousPosition, status, checkInMethod) VALUES (?, ?, ?, ?, ?, ?)`, q);
  }
  console.log("Inserted queue entries");

  // Stock Items
  const stockData = [
    ["Amoxicillin", "500mg", "Capsules", 8, 15, 100, "packs", "Aurobindo Pharma", "critical", "2026-05-05", 45],
    ["Metformin", "500mg", "Tablets", 12, 20, 150, "packs", "Merck", "critical", "2026-05-04", 60],
    ["Atorvastatin", "20mg", "Tablets", 45, 25, 120, "packs", "Pfizer", "normal", null, 30],
    ["Amlodipine", "5mg", "Tablets", 38, 20, 100, "packs", "Pfizer", "normal", null, 25],
    ["Salbutamol", "100mcg", "Inhaler", 15, 20, 80, "inhalers", "GSK", "low", "2026-05-08", 35],
    ["Paracetamol", "500mg", "Tablets", 120, 50, 200, "packs", "Reckitt", "normal", null, 80],
    ["Furosemide", "40mg", "Tablets", 6, 15, 60, "packs", "Sanofi", "critical", "2026-05-03", 28],
    ["Co-amoxiclav", "625mg", "Tablets", 3, 10, 50, "packs", "GSK", "out_of_stock", "2026-05-02", 25],
    ["Apixaban", "5mg", "Tablets", 14, 15, 50, "packs", "Bristol-Myers", "low", "2026-05-07", 20],
    ["Methotrexate", "10mg", "Tablets", 9, 10, 40, "packs", "Pfizer", "low", "2026-05-06", 12],
  ];

  for (const st of stockData) {
    await conn.execute(`INSERT INTO stockItems (drugName, strength, form, currentStock, reorderPoint, maxStock, unit, supplier, status, aiPredictedRunout, aiPredictedDemand) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, st);
  }
  console.log("Inserted stock items");

  // Alerts
  const alertData = [
    ["critical", "Patient waiting 52 minutes", "Patient Q-1281 (Jane Smith, MRN: 445291) has been waiting 52 minutes for Amoxicillin prescription. Medication is ready but patient has not collected.", "prescription", rxId("RX-2026-08912"), false],
    ["warning", "Stock alert: Metformin running low", "Only 12 packs of Metformin 500mg remaining. Reorder point is 20 packs. AI predicts stock will run out in 2 days.", "stock", 2, false],
    ["info", "AI reordered queue", "AI agent moved 2 discharge prescriptions to front of queue — patients waiting in car park.", "system", null, false],
    ["success", "Batch dispense complete", "8 discharge prescriptions batch-dispensed. Average processing time: 6.3 minutes.", "prescription", null, false],
    ["warning", "Stock alert: Furosemide critical", "Furosemide 40mg stock critical — only 6 packs remaining. AI predicts runout by end of day.", "stock", 7, false],
    ["critical", "Co-amoxiclav out of stock", "Co-amoxiclav 625mg is out of stock. 2 pending prescriptions require this medication.", "stock", 8, false],
    ["info", "AI staffing suggestion", "AI predicts patient surge at 15:30. Recommend adding 1 dispenser for 15:00-17:00 shift.", "system", null, false],
    ["success", "Priority dispense completed", "STAT prescription for A&E patient dispensed in 8 minutes — exceeding 15-minute target.", "prescription", null, false],
  ];

  for (const a of alertData) {
    await conn.execute(`INSERT INTO alerts (type, title, message, relatedEntity, relatedId, isRead) VALUES (?, ?, ?, ?, ?, ?)`, a);
  }
  console.log("Inserted alerts");

  // AI Agent Logs
  const aiLogs = [
    ["queue_reorder", "Moved 3 discharge prescriptions to front of queue — patients waiting in car park", 94, true, 18],
    ["priority_flag", "Flagged prescription RX-08914 as URGENT — 6 items with 3 potential drug interactions", 98, true, 12],
    ["staff_suggest", "Suggested assigning complex prescription to Senior Pharmacist Dr. Williams", 89, true, 8],
    ["stock_alert", "Predicted Metformin 500mg stock depletion in 2 days", 92, false, null],
    ["patient_notify", "Auto-sent SMS to patient in car park — prescription ready for collection", 99, true, 5],
    ["queue_reorder", "Prioritised STAT prescription from A&E — moved to position 1 in dispensing queue", 99, true, 15],
    ["priority_flag", "Flagged elderly patient (age 82) prescription for expedited review", 87, true, 10],
    ["staff_suggest", "Recommended technician K. Okafor for insulin dispensing — trained on cold-chain", 95, true, 7],
    ["stock_alert", "Predicted Amoxicillin demand increase of 40% next week", 85, true, null],
    ["queue_reorder", "Batch-optimised 4 Amoxicillin prescriptions — same drug, same shelf location", 91, true, 12],
    ["patient_notify", "Sent reminder to patient waiting 35+ minutes", 96, true, 3],
    ["staff_suggest", "Suggested early break for M. Chen before predicted 14:30 peak", 82, false, null],
    ["priority_flag", "Auto-flagged penicillin allergy on Clarithromycin prescription", 91, true, 8],
    ["queue_reorder", "Moved car park collection prescriptions to priority", 93, true, 14],
    ["stock_alert", "Predicted Furosemide stockout by end of day", 97, true, null],
    ["patient_notify", "Auto-SMS sent: prescription ready in locker for collection", 99, true, 4],
    ["staff_suggest", "Recommend additional dispenser for Tuesday 15:00-17:00", 91, null, null],
    ["queue_reorder", "AI-optimised queue for 3 temperature-sensitive items — insulin prioritised", 96, true, 9],
    ["priority_flag", "DMARD prescription flagged — requires recent blood result verification", 96, true, 11],
    ["stock_alert", "Detected Apixaban running low — 14 packs remaining, 5-day supply", 88, false, null],
  ];

  for (const log of aiLogs) {
    await conn.execute(`INSERT INTO aiAgentLogs (action, description, confidence, wasAccepted, timeSaved) VALUES (?, ?, ?, ?, ?)`, log);
  }
  console.log("Inserted AI logs");

  // Daily Metrics
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const aiActive = i <= 15;
    const factor = aiActive ? 0.65 + (15 - i) * 0.015 : 1.0;
    
    await conn.execute(
      `INSERT INTO dailyMetrics (date, totalPrescriptions, totalCollected, avgWaitTime, maxWaitTime, patientsWaitingPeak, aiTasksCompleted, aiAccuracy, staffHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dateStr, Math.floor((120 + Math.random() * 40) * (aiActive ? 1.15 : 1.0)), Math.floor((115 + Math.random() * 35) * (aiActive ? 1.15 : 1.0)), Math.floor((28 * factor) + Math.random() * 5), Math.floor((55 * factor) + Math.random() * 15), Math.floor((38 * factor) + Math.random() * 8), aiActive ? Math.floor(20 + Math.random() * 30) : 0, aiActive ? (85 + Math.random() * 12).toFixed(2) : null, (42 + Math.random() * 6).toFixed(2)]
    );
  }
  console.log("Inserted daily metrics");

  await conn.end();
  console.log("Seed complete!");
}

seed().catch(e => {
  console.error("Seed error:", e);
  process.exit(1);
});
