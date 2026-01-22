import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";

const getAll = protectedProcedure.query(async ({ ctx }) => {
    const credentials = await ctx.prisma.credentials.findMany({
        where: {
            userId: ctx.userId,
        },
    });
    return credentials;
});

const create = protectedProcedure
    .input(z.object({
        title: z.string(),
        platform: z.string(),
        keys: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
        const credential = await ctx.prisma.credentials.create({
            data: {
                title: input.title,
                platform: input.platform as any,
                keys: input.keys,
                userId: ctx.userId,
            }
        });
        return credential;
    });

const update = protectedProcedure
    .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        keys: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.credentials.findFirst({
            where: { id: input.id, userId: ctx.userId }
        });

        if (!existing) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Credential not found'
            });
        }

        const credential = await ctx.prisma.credentials.update({
            where: { id: input.id },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.keys && { keys: input.keys }),
            }
        });
        return credential;
    });

const deleteCredential = protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.credentials.findFirst({
            where: { id: input.id, userId: ctx.userId }
        });

        if (!existing) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Credential not found'
            });
        }

        await ctx.prisma.credentials.delete({
            where: { id: input.id }
        });

        return { success: true };
    });

export const credentialsRouter = router({
    getAll,
    create,
    update,
    delete: deleteCredential,
});
