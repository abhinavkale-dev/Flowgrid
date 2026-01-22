import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import superjson from 'superjson';

export type Context = {
    session: Awaited<ReturnType<typeof getSession>>;
    prisma: typeof prisma;
    userId: string | null;
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    const session = await getSession();

    return {
        session,
        prisma,
        userId: session?.user?.id ?? null,
    }
}

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape }) => shape
})

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
})

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);




