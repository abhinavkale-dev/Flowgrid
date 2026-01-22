import { router } from "../trpc";
import { credentialsRouter } from "./credentials";
import { workflowRouter } from "./workflow";

export const appRouter = router({
    workflow: workflowRouter,
    credentials: credentialsRouter,
});

export type AppRouter = typeof appRouter;