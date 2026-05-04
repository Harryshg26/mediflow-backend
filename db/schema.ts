import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  date,
  boolean,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Patients table
export const patients = mysqlTable("patients", {
  id: serial("id").primaryKey(),
  mrn: varchar("mrn", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  dateOfBirth: date("dateOfBirth").notNull(),
  allergies: text("allergies"),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactEmail: varchar("contactEmail", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;

// Staff table
export const staff = mysqlTable("staff", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["pharmacist", "technician", "manager"]).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  avatarUrl: varchar("avatarUrl", { length: 255 }),
  status: mysqlEnum("status", ["active", "onbreak", "offline"]).default("active").notNull(),
  currentTask: varchar("currentTask", { length: 200 }),
  prescriptionsHandled: int("prescriptionsHandled").default(0).notNull(),
  avgProcessingTime: int("avgProcessingTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Staff = typeof staff.$inferSelect;

// Prescriptions table
export const prescriptions = mysqlTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionId: varchar("prescriptionId", { length: 30 }).notNull().unique(),
  patientId: bigint("patientId", { mode: "number", unsigned: true }).notNull(),
  prescriberName: varchar("prescriberName", { length: 100 }).notNull(),
  source: mysqlEnum("source", ["outpatient", "discharge", "ae", "clinic"]).notNull(),
  urgency: mysqlEnum("urgency", ["stat", "urgent", "standard"]).default("standard").notNull(),
  status: mysqlEnum("status", ["received", "checking", "dispensing", "ready", "collected", "cancelled"]).default("received").notNull(),
  items: int("items").notNull(),
  keyDrug: varchar("keyDrug", { length: 100 }),
  clinicalNotes: text("clinicalNotes"),
  collectionMethod: mysqlEnum("collectionMethod", ["walkin", "carpark", "ward", "locker"]).default("walkin").notNull(),
  assignedTo: bigint("assignedTo", { mode: "number", unsigned: true }),
  aiPriority: mysqlEnum("aiPriority", ["urgent", "high", "medium", "low"]).default("medium").notNull(),
  aiPriorityReason: varchar("aiPriorityReason", { length: 200 }),
  aiConfidence: decimal("aiConfidence", { precision: 5, scale: 2 }),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  checkingAt: timestamp("checkingAt"),
  dispensingAt: timestamp("dispensingAt"),
  readyAt: timestamp("readyAt"),
  collectedAt: timestamp("collectedAt"),
  cancelledAt: timestamp("cancelledAt"),
  waitTimeMinutes: int("waitTimeMinutes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prescription = typeof prescriptions.$inferSelect;

// Medications table
export const medications = mysqlTable("medications", {
  id: serial("id").primaryKey(),
  prescriptionId: bigint("prescriptionId", { mode: "number", unsigned: true }).notNull(),
  drugName: varchar("drugName", { length: 100 }).notNull(),
  strength: varchar("strength", { length: 50 }),
  form: varchar("form", { length: 50 }),
  dosage: varchar("dosage", { length: 100 }),
  quantity: int("quantity"),
  instructions: text("instructions"),
  isDispensed: boolean("isDispensed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;

// Queue entries table
export const queueEntries = mysqlTable("queueEntries", {
  id: serial("id").primaryKey(),
  prescriptionId: bigint("prescriptionId", { mode: "number", unsigned: true }).notNull(),
  queueNumber: varchar("queueNumber", { length: 10 }).notNull(),
  position: int("position").notNull(),
  previousPosition: int("previousPosition"),
  status: mysqlEnum("status", ["waiting", "called", "collected", "cancelled"]).default("waiting").notNull(),
  checkInMethod: mysqlEnum("checkInMethod", ["kiosk", "staff", "auto"]).default("staff").notNull(),
  notifiedAt: timestamp("notifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QueueEntry = typeof queueEntries.$inferSelect;

// Stock items table
export const stockItems = mysqlTable("stockItems", {
  id: serial("id").primaryKey(),
  drugName: varchar("drugName", { length: 100 }).notNull(),
  strength: varchar("strength", { length: 50 }),
  form: varchar("form", { length: 50 }),
  currentStock: int("currentStock").default(0).notNull(),
  reorderPoint: int("reorderPoint").default(0).notNull(),
  maxStock: int("maxStock"),
  unit: varchar("unit", { length: 20 }),
  supplier: varchar("supplier", { length: 100 }),
  status: mysqlEnum("status", ["normal", "low", "critical", "out_of_stock"]).default("normal").notNull(),
  aiPredictedRunout: date("aiPredictedRunout"),
  aiPredictedDemand: int("aiPredictedDemand"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockItem = typeof stockItems.$inferSelect;

// Alerts table
export const alerts = mysqlTable("alerts", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["critical", "warning", "info", "success"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  relatedEntity: mysqlEnum("relatedEntity", ["prescription", "stock", "staff", "system"]),
  relatedId: bigint("relatedId", { mode: "number", unsigned: true }),
  isRead: boolean("isRead").default(false).notNull(),
  dismissedAt: timestamp("dismissedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;

// AI Agent logs table
export const aiAgentLogs = mysqlTable("aiAgentLogs", {
  id: serial("id").primaryKey(),
  action: mysqlEnum("action", ["queue_reorder", "priority_flag", "staff_suggest", "stock_alert", "patient_notify"]).notNull(),
  description: text("description").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  wasAccepted: boolean("wasAccepted"),
  timeSaved: int("timeSaved"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIAgentLog = typeof aiAgentLogs.$inferSelect;

// Daily metrics table
export const dailyMetrics = mysqlTable("dailyMetrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalPrescriptions: int("totalPrescriptions").default(0).notNull(),
  totalCollected: int("totalCollected").default(0).notNull(),
  avgWaitTime: int("avgWaitTime"),
  maxWaitTime: int("maxWaitTime"),
  patientsWaitingPeak: int("patientsWaitingPeak").default(0).notNull(),
  aiTasksCompleted: int("aiTasksCompleted").default(0).notNull(),
  aiAccuracy: decimal("aiAccuracy", { precision: 5, scale: 2 }),
  staffHours: decimal("staffHours", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMetric = typeof dailyMetrics.$inferSelect;

// Settings table
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  hospitalName: varchar("hospitalName", { length: 200 }).default("St Thomas' Hospital").notNull(),
  pharmacyName: varchar("pharmacyName", { length: 200 }).default("Outpatient Pharmacy").notNull(),
  targetWaitTime: int("targetWaitTime").default(15).notNull(),
  amberThreshold: int("amberThreshold").default(30).notNull(),
  redThreshold: int("redThreshold").default(45).notNull(),
  operatingHoursStart: varchar("operatingHoursStart", { length: 10 }).default("08:00").notNull(),
  operatingHoursEnd: varchar("operatingHoursEnd", { length: 10 }).default("20:00").notNull(),
  aiAgentEnabled: boolean("aiAgentEnabled").default(true).notNull(),
  aiOptimizationLevel: mysqlEnum("aiOptimizationLevel", ["conservative", "balanced", "aggressive"]).default("balanced").notNull(),
  autoQueueReorder: boolean("autoQueueReorder").default(true).notNull(),
  autoStaffSuggestions: boolean("autoStaffSuggestions").default(true).notNull(),
  autoPatientNotifications: boolean("autoPatientNotifications").default(true).notNull(),
  notificationThreshold: int("notificationThreshold").default(30).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Settings = typeof settings.$inferSelect;
