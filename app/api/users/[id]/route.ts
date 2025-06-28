import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/app/lib/database/users"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userData = await request.json()
    const updatedUser = await updateUser(params.id, userData)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteUser(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
