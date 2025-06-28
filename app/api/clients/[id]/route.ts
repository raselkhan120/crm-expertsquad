import { type NextRequest, NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient } from "@/app/lib/database/clients"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await getClientById(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error in GET /api/clients/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientData = await request.json()
    const updatedClient = await updateClient(params.id, clientData)
    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error in PUT /api/clients/[id]:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteClient(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/clients/[id]:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
