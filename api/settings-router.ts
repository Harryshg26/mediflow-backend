import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select().from(settings).limit(1);
    if (result[0]) return result[0];
    
    // Create default settings if none exist
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
    
    const newResult = await db.select().from(settings).limit(1);
    return newResult[0];
  }),

  update: publicQuery
    .input(z.object({
      hospitalName: z.string().optional(),
      pharmacyName: z.string().optional(),
      targetWaitTime: z.number().optional(),
      amberThreshold: z.number().optional(),
      redThreshold: z.number().optional(),
      operatingHoursStart: z.string().optional(),
      operatingHoursEnd: z.string().optional(),
      aiAgentEnabled: z.boolean().optional(),
      aiOptimizationLevel: z.enum(["conservative", "balanced", "aggressive"]).optional(),
      autoQueueReorder: z.boolean().optional(),
      autoStaffSuggestions: z.boolean().optional(),
      autoPatientNotifications: z.boolean().optional(),
      notificationThreshold: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(settings).limit(1);
      
      if (!existing[0]) {
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
          ...input,
        });
      } else {
        await db.update(settings)
          .set(input)
          .where(eq(settings.id, existing[0].id));
      }
      
      const result = await db.select().from(settings).limit(1);
      return result[0];
    }),
});
