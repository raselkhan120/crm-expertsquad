import { connectToDatabase } from "../mongodb"
import { ObjectId } from "mongodb"

export interface ActivityLog {
  _id?: ObjectId
  id: string
  entityType: "note" | "client" | "user"
  entityId: string
  action: "created" | "updated" | "deleted"
  changes?: Record<string, { from: any; to: any }>
  performedBy: string
  timestamp: string
  metadata?: Record<string, any>
}

export async function logActivity(activity: Omit<ActivityLog, "_id" | "id" | "timestamp">): Promise<ActivityLog> {
  try {
    const { db } = await connectToDatabase()
    const newActivity: Omit<ActivityLog, "_id"> = {
      ...activity,
      id: new ObjectId().toString(),
      timestamp: new Date().toISOString(),
    }

    const result = await db.collection("activity_logs").insertOne(newActivity)
    return {
      ...newActivity,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error logging activity:", error)
    throw error
  }
}

export async function getActivityLogs(entityType?: string, entityId?: string): Promise<ActivityLog[]> {
  try {
    const { db } = await connectToDatabase()
    const query: any = {}

    if (entityType) query.entityType = entityType
    if (entityId) query.entityId = entityId

    const activities = await db.collection("activity_logs").find(query).sort({ timestamp: -1 }).toArray()

    return activities.map((activity) => ({
      ...activity,
      id: activity._id?.toString() || activity.id,
    })) as ActivityLog[]
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }
}

export async function getNoteActivityLogs(noteId: string): Promise<ActivityLog[]> {
  return getActivityLogs("note", noteId)
}
