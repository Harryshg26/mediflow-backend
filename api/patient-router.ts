import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patients } from "@db/schema";
import { eq, like, or } from "drizzle-orm";

export const patientRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const search = input?.search;
      
      if (search) {
        return db.select().from(patients)
          .where(or(
            like(patients.name, `%${search}%`),
            like(patients.mrn, `%${search}%`)
          ))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
      }
      
      return db.select().from(patients)
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  getByMrn: publicQuery
    .input(z.object({ mrn: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(patients)
        .where(eq(patients.mrn, input.mrn));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      mrn: z.string(),
      name: z.string(),
      dateOfBirth: z.string(),
      allergies: z.string().optional(),
      contactPhone: z.string().optional(),
      contactEmail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(patients).values({
        ...input,
        dateOfBirth: new Date(input.dateOfBirth),
      });
      const result = await db.select().from(patients)
        .where(eq(patients.mrn, input.mrn));
      return result[0];
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      allergies: z.string().optional(),
      contactPhone: z.string().optional(),
      contactEmail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(patients).set(data).where(eq(patients.id, id));
      const result = await db.select().from(patients).where(eq(patients.id, id));
      return result[0];
    }),
});
