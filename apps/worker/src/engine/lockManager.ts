import { prisma } from "@repo/prisma";

export async function acquireLock(workflowRunId: string, workerId: string): Promise<boolean> {
    const staleLockCutoff = new Date(Date.now() - 5 * 60 * 1000);

    const updateResult = await prisma.workflowRun.updateMany({
        where: {
            id: workflowRunId,
            OR: [
                { lockedAt: null },                   
                { lockedAt: { lt: staleLockCutoff } }  
            ]
        },
        data: {
            lockedAt: new Date(),
            lockedBy: workerId
        }
    });

    if(updateResult.count > 0) {
        return true;
    }

    return false;
}

export async function releaseLock(workflowRunId: string): Promise<void> {
    await prisma.workflowRun.update({
        where: {
            id: workflowRunId
        },
        data: {
            lockedAt: null,
            lockedBy: null
        }
    })
}

export async function isLocked(workflowRunId: string): Promise<boolean> {
    const workflowRun = await prisma.workflowRun.findUnique({
        where: { id: workflowRunId },
        select: { lockedAt: true }
    })

    if(!workflowRun) {
        return false;
    }

    if(!workflowRun.lockedAt) {
        return false;
    }

    const lockAge = Date.now() - workflowRun.lockedAt.getTime();
    const maxLockAge = 5 * 60 * 1000;

    if(lockAge > maxLockAge) {
        return false;
    }

    return true;
}