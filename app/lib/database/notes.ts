import { connectToDatabase } from "../mongodb"
import { COLLECTIONS, type Note } from "./schemas"
import { ObjectId } from "mongodb"
import { logActivity } from "./activity"

export async function getNotes(): Promise<Note[]> {
  try {
    const { db } = await connectToDatabase()
    const notes = await db.collection(COLLECTIONS.notes).find({}).sort({ createdAt: -1 }).toArray()
    return notes.map((note) => ({
      ...note,
      id: note._id?.toString() || note.id,
    })) as Note[]
  } catch (error) {
    console.error("Error fetching notes:", error)
    return []
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const { db } = await connectToDatabase()
    const note = await db.collection(COLLECTIONS.notes).findOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })
    if (!note) return null
    return {
      ...note,
      id: note._id?.toString() || note.id,
    } as Note
  } catch (error) {
    console.error("Error fetching note:", error)
    return null
  }
}

export async function createNote(noteData: Omit<Note, "_id" | "id" | "createdAt">): Promise<Note> {
  try {
    const { db } = await connectToDatabase()
    const newNote: Omit<Note, "_id"> = {
      ...noteData,
      id: new ObjectId().toString(),
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection(COLLECTIONS.notes).insertOne(newNote)
    const createdNote = {
      ...newNote,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    }

    // Log activity
    await logActivity({
      entityType: "note",
      entityId: createdNote.id,
      action: "created",
      performedBy: noteData.createdBy,
      metadata: {
        title: noteData.title,
        category: noteData.category,
        priority: noteData.priority,
      },
    })

    return createdNote
  } catch (error) {
    console.error("Error creating note:", error)
    throw error
  }
}

export async function updateNote(id: string, noteData: Partial<Note>): Promise<Note | null> {
  try {
    const { db } = await connectToDatabase()

    // Get the current note to track changes
    const currentNote = await getNoteById(id)
    if (!currentNote) return null

    const updateData = {
      ...noteData,
      updatedAt: new Date().toISOString(),
    }

    const result = await db
      .collection(COLLECTIONS.notes)
      .findOneAndUpdate({ $or: [{ id }, { _id: new ObjectId(id) }] }, { $set: updateData }, { returnDocument: "after" })

    if (!result) return null

    const updatedNote = {
      ...result,
      id: result._id?.toString() || result.id,
    } as Note

    // Track changes for activity log
    const changes: Record<string, { from: any; to: any }> = {}

    if (noteData.title && noteData.title !== currentNote.title) {
      changes.title = { from: currentNote.title, to: noteData.title }
    }
    if (noteData.content && noteData.content !== currentNote.content) {
      changes.content = { from: currentNote.content, to: noteData.content }
    }
    if (noteData.category && noteData.category !== currentNote.category) {
      changes.category = { from: currentNote.category, to: noteData.category }
    }
    if (noteData.priority && noteData.priority !== currentNote.priority) {
      changes.priority = { from: currentNote.priority, to: noteData.priority }
    }

    // Log activity only if there are actual changes
    if (Object.keys(changes).length > 0) {
      await logActivity({
        entityType: "note",
        entityId: updatedNote.id,
        action: "updated",
        changes,
        performedBy: noteData.updatedBy || currentNote.createdBy,
        metadata: {
          title: updatedNote.title,
          category: updatedNote.category,
          priority: updatedNote.priority,
        },
      })
    }

    return updatedNote
  } catch (error) {
    console.error("Error updating note:", error)
    return null
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Get the note before deletion for activity log
    const noteToDelete = await getNoteById(id)
    if (!noteToDelete) return false

    const result = await db.collection(COLLECTIONS.notes).deleteOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })

    if (result.deletedCount > 0) {
      // Log activity
      await logActivity({
        entityType: "note",
        entityId: id,
        action: "deleted",
        performedBy: noteToDelete.createdBy, // We don't have the deleter info, using creator
        metadata: {
          title: noteToDelete.title,
          category: noteToDelete.category,
          priority: noteToDelete.priority,
        },
      })
    }

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting note:", error)
    return false
  }
}

export async function getNotesByCreator(creatorId: string): Promise<Note[]> {
  try {
    const { db } = await connectToDatabase()
    const notes = await db
      .collection(COLLECTIONS.notes)
      .find({ createdBy: creatorId })
      .sort({ createdAt: -1 })
      .toArray()
    return notes.map((note) => ({
      ...note,
      id: note._id?.toString() || note.id,
    })) as Note[]
  } catch (error) {
    console.error("Error fetching notes by creator:", error)
    return []
  }
}
