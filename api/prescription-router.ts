import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { prescriptions, medications, patients, staff } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const prescriptionRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(25),
      offset: z.number().default(0),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(prescriptions.status, input.status as any));
      }
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      return db.select({
        id: prescriptions.id,
        prescriptionId: prescriptions.prescriptionId,
        patientId: prescriptions.patientId,
        prescriberName: prescriptions.prescriberName,
        source: prescriptions.source,
        urgency: prescriptions.urgency,
        status: prescriptions.status,
        items: prescriptions.items,
        keyDrug: prescriptions.keyDrug,
        collectionMethod: prescriptions.collectionMethod,
        assignedTo: prescriptions.assignedTo,
        aiPriority: prescriptions.aiPriority,
        aiPriorityReason: prescriptions.aiPriorityReason,
        aiConfidence: prescriptions.aiConfidence,
        receivedAt: prescriptions.receivedAt,
        readyAt: prescriptions.readyAt,
        collectedAt: prescriptions.collectedAt,
        waitTimeMinutes: prescriptions.waitTimeMinutes,
      }).from(prescriptions)
        .where(where)
        .orderBy(desc(prescriptions.receivedAt))
        .limit(input?.limit ?? 25)
        .offset(input?.offset ?? 0);
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rx = await db.select().from(prescriptions)
        .where(eq(prescriptions.id, input.id));
      if (!rx[0]) return null;
      
      const meds = await db.select().from(medications)
        .where(eq(medications.prescriptionId, input.id));
      
      const patient = await db.select().from(patients)
        .where(eq(patients.id, rx[0].patientId));
      
      const assignedStaff = rx[0].assignedTo 
        ? await db.select().from(staff).where(eq(staff.id, rx[0].assignedTo))
        : [];
      
      return {
        ...rx[0],
        medications: meds,
        patient: patient[0] ?? null,
        assignedStaff: assignedStaff[0] ?? null,
      };
    }),

  create: publicQuery
    .input(z.object({
      patientId: z.number(),
      prescriberName: z.string(),
      source: z.enum(["outpatient", "discharge", "ae", "clinic"]),
      urgency: z.enum(["stat", "urgent", "standard"]).default("standard"),
      items: z.number(),
      keyDrug: z.string().optional(),
      clinicalNotes: z.string().optional(),
      collectionMethod: z.enum(["walkin", "carpark", "ward", "locker"]).default("walkin"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const pid = `RX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      await db.insert(prescriptions).values({
        ...input,
        prescriptionId: pid,
        status: "received",
      });
      const result = await db.select().from(prescriptions)
        .where(eq(prescriptions.prescriptionId, pid));
      return result[0];
    }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["received", "checking", "dispensing", "ready", "collected", "cancelled"]),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(prescriptions).set(data).where(eq(prescriptions.id, id));
      const result = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
      return result[0];
    }),

  getStats: publicQuery
    .input(z.object({
      period: z.enum(["today", "week", "month"]).default("today"),
    }))
    .query(async () => {
      const db = getDb();
      const all = await db.select().from(prescriptions);
      
      const byStatus = {
        received: all.filter(r => r.status === "received").length,
        checking: all.filter(r => r.status === "checking").length,
        dispensing: all.filter(r => r.status === "dispensing").length,
        ready: all.filter(r => r.status === "ready").length,
        collected: all.filter(r => r.status === "collected").length,
        cancelled: all.filter(r => r.status === "cancelled").length,
      };
      
      const urgent = all.filter(r => r.aiPriority === "urgent" || r.urgency === "stat").length;
      const avgWait = all.filter(r => r.waitTimeMinutes).reduce((sum, r) => sum + (r.waitTimeMinutes ?? 0), 0) / (all.filter(r => r.waitTimeMinutes).length || 1);
      
      return {
        total: all.length,
        byStatus,
        urgent,
        averageWaitTime: Math.round(avgWait),
      };
    }),
});
