import { prisma } from "@/lib/prisma"
import type { ActivityLogMetadata, ActivityLogRecord } from "@/components/form/types"

export type ActivityAction = "created" | "updated" | "deleted" | "checked_out"

export async function logActivity(
  kind: string,
  action: ActivityAction,
  description: string,
  entityId?: string,
  metadata?: ActivityLogMetadata,
) {
  await prisma.activityLog.create({
    data: {
      kind,
      action,
      description,
      entityId: entityId ?? null,
      metadata: metadata ?? undefined,
    },
  })
}

function mapActivityLog(log: {
  id: string
  kind: string
  action: string
  description: string
  entityId: string | null
  metadata: unknown
  createdAt: Date
}): ActivityLogRecord {
  return {
    id: log.id,
    kind: log.kind,
    action: log.action,
    description: log.description,
    entityId: log.entityId ?? undefined,
    metadata: parseActivityMetadata(log.metadata),
    createdAt: log.createdAt.toISOString(),
  }
}

function parseActivityMetadata(metadata: unknown): ActivityLogMetadata | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined
  }

  return metadata as ActivityLogMetadata
}

export async function getRecentActivities(limit = 20): Promise<ActivityLogRecord[]> {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return logs.map(mapActivityLog)
}
