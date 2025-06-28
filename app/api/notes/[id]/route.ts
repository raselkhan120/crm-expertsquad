import { type NextRequest, NextResponse } from "next/server"
import { getNoteById, updateNote, deleteNote } from "@/app/lib/database/notes"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const note = await getNoteById(params.id)
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    return NextResponse.json(note)
  } catch (error) {
    console.error("Error in GET /api/notes/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const noteData = await request.json()
    const updatedNote = await updateNote(params.id, noteData)
    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error in PUT /api/notes/[id]:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteNote(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/notes/[id]:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
