import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { patientRouter } from "./patient-router";
import { prescriptionRouter } from "./prescription-router";
import { queueRouter } from "./queue-router";
import { staffRouter } from "./staff-router";
import { stockRouter } from "./stock-router";
import { alertRouter } from "./alert-router";
import { aiRouter } from "./ai-router";
import { analyticsRouter } from "./analytics-router";
import { settingsRouter } from "./settings-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  patient: patientRouter,
  prescription: prescriptionRouter,
  queue: queueRouter,
  staff: staffRouter,
  stock: stockRouter,
  alert: alertRouter,
  ai: aiRouter,
  analytics: analyticsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
