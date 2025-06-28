import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  id: string
  name: string
  email: string
  password?: string
  role: "admin" | "user"
  avatar?: string
  createdAt: string
  updatedAt?: string
}

export interface Client {
  _id?: ObjectId
  id: string
  clientName: string
  jobTitle: string
  email: string
  organization: string
  phoneNumber: string
  freelancePlatform: string
  projectStage: string
  projectValue: number
  status: string
  meetingDate: string
  nextAction: string
  link?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface Note {
  _id?: ObjectId
  id: string
  title: string
  content: string
  category: "general" | "client" | "project" | "meeting" | "idea"
  priority: "low" | "medium" | "high"
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt?: string
}

export interface DatabaseCollections {
  users: "users"
  clients: "clients"
  notes: "notes"
}

export const COLLECTIONS: DatabaseCollections = {
  users: "users",
  clients: "clients",
  notes: "notes",
}
