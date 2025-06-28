import { type NextRequest, NextResponse } from "next/server"
import { getNotes, createNote } from "@/app/lib/database/notes"

export async function GET() {
  try {
    const notes = await getNotes()
    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error in GET /api/notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const noteData = await request.json()
    const newNote = await createNote(noteData)
    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/notes:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
