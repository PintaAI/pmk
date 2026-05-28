import { prisma } from "@/lib/prisma"
import type { ActivityLogRecord } from "@/components/form/types"

export type ActivityAction = "created" | "updated" | "deleted" | "checked_out"

export async function logActivity(
  kind: string,
  action: ActivityAction,
  description: string,
  entityId?: string,
) {
  await prisma.activityLog.create({
    data: {
      kind,
      action,
      description,
      entityId: entityId ?? null,
    },
  })
}

function mapActivityLog(log: {
  id: string
  kind: string
  action: string
  description: string
  entityId: string | null
  createdAt: Date
}): ActivityLogRecord {
  return {
    id: log.id,
    kind: log.kind,
    action: log.action,
    description: log.description,
    entityId: log.entityId ?? undefined,
    createdAt: log.createdAt.toISOString(),
  }
}

export async function getRecentActivities(limit = 20): Promise<ActivityLogRecord[]> {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return logs.map(mapActivityLog)
}
