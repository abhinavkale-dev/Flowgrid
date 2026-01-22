import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";

const getAll = protectedProcedure.query(async ({ ctx }) => {
    const workflows = await ctx.prisma.workflow.findMany({
        where: {
            userId: ctx.userId,
        },
        include: {
            trigger: {
                include: { type: true }
            },
            actions: {
                include: { type: true },
                orderBy: { sortingOrder: 'asc' }
            }
        }
    });
    return workflows;
});

const getById = protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
        const workflow = await ctx.prisma.workflow.findFirst({
            where: {
                id: input.id,
                userId: ctx.userId,
            },
            include: {
                trigger: {
                    include: { type: true }
                },
                actions: {
                    include: { type: true },
                    orderBy: { sortingOrder: 'asc' }
                }
            }
        });

        if (!workflow) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Workflow not found'
            });
        }

        return workflow;
    });

const create = protectedProcedure
    .input(z.object({
        id: z.string(),
        title: z.string(),
        availableTriggerId: z.string(),
        triggerMetadata: z.record(z.any()),
        actions: z.array(z.object({
            id: z.string(),
            availableActionId: z.string(),
            metadata: z.record(z.any()),
        })),
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
        const workflow = await ctx.prisma.workflow.create({
            data: {
                id: input.id,
                title: input.title,
                userId: ctx.userId,
                nodes: input.nodes,
                edges: input.edges,
                trigger: {
                    create: {
                        availableTriggerId: input.availableTriggerId,
                        metadata: input.triggerMetadata,
                    }
                },
                actions: {
                    create: input.actions.map((action, index) => ({
                        id: action.id,
                        availableActionId: action.availableActionId,
                        sortingOrder: index,
                        metadata: action.metadata,
                    }))
                }
            },
            include: {
                trigger: {
                    include: { type: true }
                },
                actions: {
                    include: { type: true },
                    orderBy: { sortingOrder: 'asc' }
                }
            }
        });
        return workflow;
    });

const update = protectedProcedure
    .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        nodes: z.array(z.any()).optional(),
        edges: z.array(z.any()).optional(),
        triggerMetadata: z.record(z.any()).optional(),
        actions: z.array(z.object({
            id: z.string(),
            availableActionId: z.string(),
            metadata: z.record(z.any()),
        })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.workflow.findFirst({
            where: { id: input.id, userId: ctx.userId }
        });

        if (!existing) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Workflow not found'
            });
        }

        const workflow = await ctx.prisma.workflow.update({
            where: { id: input.id },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.nodes && { nodes: input.nodes }),
                ...(input.edges && { edges: input.edges }),
            },
            include: {
                trigger: {
                    include: { type: true }
                },
                actions: {
                    include: { type: true },
                    orderBy: { sortingOrder: 'asc' }
                }
            }
        });

        if (input.triggerMetadata && existing) {
            await ctx.prisma.trigger.updateMany({
                where: { workflowId: input.id },
                data: { metadata: input.triggerMetadata }
            });
        }

        if (input.actions) {
            await ctx.prisma.action.deleteMany({
                where: { workflowId: input.id }
            });

            await ctx.prisma.action.createMany({
                data: input.actions.map((action, index) => ({
                    id: action.id,
                    workflowId: input.id,
                    availableActionId: action.availableActionId,
                    sortingOrder: index,
                    metadata: action.metadata,
                }))
            });
        }

        return workflow;
    });

const deleteWorkflow = protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.workflow.findFirst({
            where: { id: input.id, userId: ctx.userId }
        });

        if (!existing) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Workflow not found'
            });
        }

        await ctx.prisma.workflow.delete({
            where: { id: input.id }
        });

        return { success: true };
    });

export const workflowRouter = router({
    getAll,
    getById,
    create,
    update,
    delete: deleteWorkflow,
});
