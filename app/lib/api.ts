import type { User } from "./auth"
import type { Client } from "./data"
import type { Note } from "./data"

// Users API
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch("/api/users")
    if (!response.ok) throw new Error("Failed to fetch users")
    return await response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User | null> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error("Failed to create user")
    return await response.json()
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error("Failed to update user")
    return await response.json()
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
    return response.ok
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Clients API
export async function fetchClients(): Promise<Client[]> {
  try {
    const response = await fetch("/api/clients")
    if (!response.ok) throw new Error("Failed to fetch clients")
    return await response.json()
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function createClient(clientData: Omit<Client, "id" | "createdAt">): Promise<Client | null> {
  try {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    })
    if (!response.ok) throw new Error("Failed to create client")
    return await response.json()
  } catch (error) {
    console.error("Error creating client:", error)
    return null
  }
}

export async function updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    })
    if (!response.ok) throw new Error("Failed to update client")
    return await response.json()
  } catch (error) {
    console.error("Error updating client:", error)
    return null
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/clients/${id}`, { method: "DELETE" })
    return response.ok
  } catch (error) {
    console.error("Error deleting client:", error)
    return false
  }
}

// Auth API
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error("Login failed")
    return await response.json()
  } catch (error) {
    console.error("Error logging in:", error)
    return null
  }
}

// Seed API
export async function seedDatabase(): Promise<boolean> {
  try {
    const response = await fetch("/api/seed", { method: "POST" })
    return response.ok
  } catch (error) {
    console.error("Error seeding database:", error)
    return false
  }
}

// Notes API
export async function fetchNotes(): Promise<Note[]> {
  try {
    const response = await fetch("/api/notes")
    if (!response.ok) throw new Error("Failed to fetch notes")
    return await response.json()
  } catch (error) {
    console.error("Error fetching notes:", error)
    return []
  }
}

export async function createNote(noteData: Omit<Note, "id" | "createdAt">): Promise<Note | null> {
  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    })
    if (!response.ok) throw new Error("Failed to create note")
    return await response.json()
  } catch (error) {
    console.error("Error creating note:", error)
    return null
  }
}

export async function updateNote(id: string, noteData: Partial<Note>): Promise<Note | null> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    })
    if (!response.ok) throw new Error("Failed to update note")
    return await response.json()
  } catch (error) {
    console.error("Error updating note:", error)
    return null
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" })
    return response.ok
  } catch (error) {
    console.error("Error deleting note:", error)
    return false
  }
}

// Activity API
export async function fetchActivityLogs(entityType?: string, entityId?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (entityType) params.append("entityType", entityType)
    if (entityId) params.append("entityId", entityId)

    const response = await fetch(`/api/activity?${params.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch activity logs")
    return await response.json()
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }
}
