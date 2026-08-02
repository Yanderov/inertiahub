import prisma from "./prisma";

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent(params: AuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
