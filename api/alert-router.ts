import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { alerts } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const alertRouter = createRouter({
  list: publicQuery
    .input(z.object({
      type: z.string().optional(),
      isRead: z.boolean().optional(),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input?.type) {
        conditions.push(eq(alerts.type, input.type as any));
      }
      if (input?.isRead !== undefined) {
        conditions.push(eq(alerts.isRead, input.isRead));
      }
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      return db.select().from(alerts)
        .where(where)
        .orderBy(desc(alerts.createdAt))
        .limit(input?.limit ?? 20);
    }),

  create: publicQuery
    .input(z.object({
      type: z.enum(["critical", "warning", "info", "success"]),
      title: z.string(),
      message: z.string(),
      relatedEntity: z.enum(["prescription", "stock", "staff", "system"]).optional(),
      relatedId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(alerts).values({
        ...input,
        isRead: false,
      });
      const result = await db.select().from(alerts)
        .orderBy(desc(alerts.createdAt))
        .limit(1);
      return result[0];
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(alerts)
        .set({ isRead: true })
        .where(eq(alerts.id, input.id));
      const result = await db.select().from(alerts).where(eq(alerts.id, input.id));
      return result[0];
    }),

  dismiss: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(alerts)
        .set({ dismissedAt: new Date() })
        .where(eq(alerts.id, input.id));
      const result = await db.select().from(alerts).where(eq(alerts.id, input.id));
      return result[0];
    }),

  getUnreadCount: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select().from(alerts)
      .where(eq(alerts.isRead, false));
    return result.length;
  }),
});
