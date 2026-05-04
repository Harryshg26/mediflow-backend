import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { queueEntries, prescriptions, patients, staff } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const queueRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const entries = await db.select().from(queueEntries)
        .orderBy(asc(queueEntries.position))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);

      const enriched = [];
      for (const entry of entries) {
        const rx = await db.select().from(prescriptions)
          .where(eq(prescriptions.id, entry.prescriptionId));
        const patient = rx[0] ? await db.select().from(patients)
          .where(eq(patients.id, rx[0].patientId)) : [null];
        const assigned = rx[0]?.assignedTo ? await db.select().from(staff)
          .where(eq(staff.id, rx[0].assignedTo)) : [null];
        
        enriched.push({
          ...entry,
          prescription: rx[0] ?? null,
          patient: patient[0] ?? null,
          assignedStaff: assigned[0] ?? null,
        });
      }
      return enriched;
    }),

  getCurrent: publicQuery.query(async () => {
    const db = getDb();
    const entries = await db.select().from(queueEntries)
      .where(eq(queueEntries.status, "waiting"))
      .orderBy(asc(queueEntries.position));

    const enriched = [];
    for (const entry of entries) {
      const rx = await db.select().from(prescriptions)
        .where(eq(prescriptions.id, entry.prescriptionId));
      const patient = rx[0] ? await db.select().from(patients)
        .where(eq(patients.id, rx[0].patientId)) : [null];
      
      enriched.push({
        ...entry,
        prescription: rx[0] ?? null,
        patient: patient[0] ?? null,
      });
    }
    return enriched;
  }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(queueEntries);
    const waiting = all.filter(q => q.status === "waiting").length;
    const collected = all.filter(q => q.status === "collected").length;
    const called = all.filter(q => q.status === "called").length;
    
    return { waiting, collected, called, total: all.length };
  }),

  checkIn: publicQuery
    .input(z.object({
      patientId: z.number(),
      prescriptionId: z.number().optional(),
      collectionMethod: z.enum(["walkin", "carpark", "ward", "locker"]).default("walkin"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const maxPos = await db.select().from(queueEntries)
        .orderBy(desc(queueEntries.position))
        .limit(1);
      
      const newPosition = (maxPos[0]?.position ?? 0) + 1;
      const qNum = `Q-${1284 + newPosition}`;
      
      await db.insert(queueEntries).values({
        prescriptionId: input.prescriptionId ?? 0,
        queueNumber: qNum,
        position: newPosition,
        status: "waiting",
        checkInMethod: "staff",
      });
      
      const result = await db.select().from(queueEntries)
        .where(eq(queueEntries.queueNumber, qNum));
      return result[0];
    }),

  markCollected: publicQuery
    .input(z.object({ queueId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(queueEntries)
        .set({ status: "collected" })
        .where(eq(queueEntries.id, input.queueId));
      
      const result = await db.select().from(queueEntries)
        .where(eq(queueEntries.id, input.queueId));
      return result[0];
    }),
});
