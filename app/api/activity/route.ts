import { type NextRequest, NextResponse } from "next/server"
import { getActivityLogs } from "@/app/lib/database/activity"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType") || undefined
    const entityId = searchParams.get("entityId") || undefined

    const activities = await getActivityLogs(entityType, entityId)
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error in GET /api/activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
