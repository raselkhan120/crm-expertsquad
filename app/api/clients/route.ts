import { type NextRequest, NextResponse } from "next/server"
import { getClients, createClient } from "@/app/lib/database/clients"

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error in GET /api/clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json()
    const newClient = await createClient(clientData)
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/clients:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
