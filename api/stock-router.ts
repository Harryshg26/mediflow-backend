import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { stockItems } from "@db/schema";
import { eq, like } from "drizzle-orm";

export const stockRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      if (input?.search) {
        return db.select().from(stockItems)
          .where(like(stockItems.drugName, `%${input.search}%`))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
      }
      
      if (input?.status) {
        return db.select().from(stockItems)
          .where(eq(stockItems.status, input.status as any))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
      }
      
      return db.select().from(stockItems)
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  getLowStock: publicQuery
    .input(z.object({
      threshold: z.number().optional(),
    }).optional())
    .query(async () => {
      const db = getDb();
      return db.select().from(stockItems)
        .where(eq(stockItems.status, "critical"));
    }),

  updateStock: publicQuery
    .input(z.object({
      id: z.number(),
      currentStock: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, currentStock } = input;
      
      // Determine status based on stock level
      const item = await db.select().from(stockItems).where(eq(stockItems.id, id));
      if (!item[0]) throw new Error("Stock item not found");
      
      let status = "normal";
      if (currentStock === 0) status = "out_of_stock";
      else if (currentStock <= (item[0].reorderPoint * 0.5)) status = "critical";
      else if (currentStock <= item[0].reorderPoint) status = "low";
      
      await db.update(stockItems)
        .set({ currentStock, status: status as any })
        .where(eq(stockItems.id, id));
      
      const result = await db.select().from(stockItems).where(eq(stockItems.id, id));
      return result[0];
    }),

  create: publicQuery
    .input(z.object({
      drugName: z.string(),
      strength: z.string().optional(),
      form: z.string().optional(),
      currentStock: z.number(),
      reorderPoint: z.number(),
      maxStock: z.number().optional(),
      unit: z.string().optional(),
      supplier: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(stockItems).values(input);
      const result = await db.select().from(stockItems)
        .where(eq(stockItems.drugName, input.drugName));
      return result[0];
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(stockItems);
    return {
      total: all.length,
      normal: all.filter(s => s.status === "normal").length,
      low: all.filter(s => s.status === "low").length,
      critical: all.filter(s => s.status === "critical").length,
      outOfStock: all.filter(s => s.status === "out_of_stock").length,
    };
  }),
});
