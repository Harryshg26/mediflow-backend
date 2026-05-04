import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { aiAgentLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const aiRouter = createRouter({
  getAgentStatus: publicQuery.query(async () => {
    const db = getDb();
    const recentLogs = await db.select().from(aiAgentLogs)
      .orderBy(desc(aiAgentLogs.createdAt))
      .limit(5);
    
    const totalLogs = await db.select().from(aiAgentLogs);
    const acceptedLogs = totalLogs.filter(l => l.wasAccepted === true);
    const totalTimeSaved = acceptedLogs.reduce((sum, l) => sum + (l.timeSaved ?? 0), 0);
    
    return {
      status: "active",
      recentActions: recentLogs,
      totalActionsToday: totalLogs.length,
      acceptedSuggestions: acceptedLogs.length,
      totalTimeSaved,
      accuracy: totalLogs.length > 0 
        ? Math.round((acceptedLogs.length / totalLogs.length) * 100) 
        : 0,
    };
  }),

  getLogs: publicQuery
    .input(z.object({
      limit: z.number().default(20),
      action: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      if (input?.action) {
        return db.select().from(aiAgentLogs)
          .where(eq(aiAgentLogs.action, input.action as any))
          .orderBy(desc(aiAgentLogs.createdAt))
          .limit(input?.limit ?? 20);
      }
      
      return db.select().from(aiAgentLogs)
        .orderBy(desc(aiAgentLogs.createdAt))
        .limit(input?.limit ?? 20);
    }),

  getPredictions: publicQuery
    .input(z.object({
      period: z.enum(["2h", "today", "week"]).default("2h"),
    }).optional())
    .query(async ({ input }) => {
      return {
        period: input?.period ?? "2h",
        predictedArrivals: 18,
        confidence: 89,
        suggestedStaffing: 3,
        currentStaffing: 2,
        predictedPeak: "15:30 — 16:30",
        tomorrowVolume: 142,
        recommendedPrep: "Pre-pack 20 common discharge meds",
      };
    }),

  getAnalytics: publicQuery
    .input(z.object({
      period: z.enum(["week", "month"]).default("week"),
    }).optional())
    .query(async () => {
      const db = getDb();
      const logs = await db.select().from(aiAgentLogs);
      
      const byAction = {
        queue_reorder: logs.filter(l => l.action === "queue_reorder").length,
        priority_flag: logs.filter(l => l.action === "priority_flag").length,
        staff_suggest: logs.filter(l => l.action === "staff_suggest").length,
        stock_alert: logs.filter(l => l.action === "stock_alert").length,
        patient_notify: logs.filter(l => l.action === "patient_notify").length,
      };
      
      const accepted = logs.filter(l => l.wasAccepted === true);
      const totalTimeSaved = accepted.reduce((sum, l) => sum + (l.timeSaved ?? 0), 0);
      
      return {
        totalActions: logs.length,
        acceptedActions: accepted.length,
        dismissedActions: logs.filter(l => l.wasAccepted === false).length,
        pendingActions: logs.filter(l => l.wasAccepted === null).length,
        byAction,
        totalTimeSaved,
        averageConfidence: logs.length > 0
          ? Math.round(logs.reduce((sum, l) => sum + Number(l.confidence ?? 0), 0) / logs.length)
          : 0,
      };
    }),

  acceptSuggestion: publicQuery
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(aiAgentLogs)
        .set({ wasAccepted: true })
        .where(eq(aiAgentLogs.id, input.logId));
      const result = await db.select().from(aiAgentLogs)
        .where(eq(aiAgentLogs.id, input.logId));
      return result[0];
    }),

  dismissSuggestion: publicQuery
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(aiAgentLogs)
        .set({ wasAccepted: false })
        .where(eq(aiAgentLogs.id, input.logId));
      const result = await db.select().from(aiAgentLogs)
        .where(eq(aiAgentLogs.id, input.logId));
      return result[0];
    }),

  getQueueOptimization: publicQuery.query(async () => {
    return {
      suggestedReorder: "Move 3 car park collection prescriptions to positions 1-3",
      estimatedTimeSaving: "14 minutes",
      confidence: 93,
    };
  }),

  getStaffRecommendations: publicQuery.query(async () => {
    return [
      {
        recommendation: "Add 1 dispenser on Tuesdays 14:00-16:00",
        reason: "Consistent peak detected over last 4 weeks",
        confidence: 91,
        estimatedImpact: "Reduce wait time by 8 minutes",
      },
      {
        recommendation: "Enable auto-SMS for patients waiting >30min",
        reason: "24% of patients abandon prescriptions after 30min wait",
        confidence: 94,
        estimatedImpact: "Reduce abandoned prescriptions by 40%",
      },
      {
        recommendation: "Pre-stock 30 Amoxicillin 500mg packs",
        reason: "Predicted high demand next week — seasonal infections",
        confidence: 87,
        estimatedImpact: "Avoid 3 stockout incidents",
      },
    ];
  }),
});
