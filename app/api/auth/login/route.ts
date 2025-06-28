import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmailAndPassword } from "@/app/lib/database/users"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await getUserByEmailAndPassword(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error in POST /api/auth/login:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
