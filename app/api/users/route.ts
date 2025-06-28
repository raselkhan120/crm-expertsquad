import { type NextRequest, NextResponse } from "next/server"
import { getUsers, createUser } from "@/app/lib/database/users"

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error in GET /api/users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const newUser = await createUser(userData)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/users:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
