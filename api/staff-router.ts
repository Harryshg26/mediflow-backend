import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { staff } from "@db/schema";
import { eq } from "drizzle-orm";

export const staffRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      role: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(staff);
      
      if (input?.status) {
        query = query.where(eq(staff.status, input.status as any)) as any;
      }
      if (input?.role) {
        query = query.where(eq(staff.role, input.role as any)) as any;
      }
      
      return query;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(staff)
        .where(eq(staff.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      role: z.enum(["pharmacist", "technician", "manager"]),
      email: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(staff).values(input);
      const result = await db.select().from(staff)
        .where(eq(staff.email, input.email));
      return result[0];
    }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "onbreak", "offline"]),
      currentTask: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(staff).set(data).where(eq(staff.id, id));
      const result = await db.select().from(staff).where(eq(staff.id, id));
      return result[0];
    }),

  updateWorkload: publicQuery
    .input(z.object({
      id: z.number(),
      prescriptionsHandled: z.number(),
      avgProcessingTime: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(staff).set(data).where(eq(staff.id, id));
      const result = await db.select().from(staff).where(eq(staff.id, id));
      return result[0];
    }),

  getWorkload: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(staff);
  }),
});
