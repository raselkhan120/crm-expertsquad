import { connectToDatabase } from "../mongodb"
import { COLLECTIONS, type Client } from "./schemas"
import { ObjectId } from "mongodb"

export async function getClients(): Promise<Client[]> {
  try {
    const { db } = await connectToDatabase()
    const clients = await db.collection(COLLECTIONS.clients).find({}).sort({ createdAt: -1 }).toArray()
    return clients.map((client) => ({
      ...client,
      id: client._id?.toString() || client.id,
    })) as Client[]
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { db } = await connectToDatabase()
    const client = await db.collection(COLLECTIONS.clients).findOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })
    if (!client) return null
    return {
      ...client,
      id: client._id?.toString() || client.id,
    } as Client
  } catch (error) {
    console.error("Error fetching client:", error)
    return null
  }
}

export async function createClient(clientData: Omit<Client, "_id" | "id" | "createdAt">): Promise<Client> {
  try {
    const { db } = await connectToDatabase()
    const newClient: Omit<Client, "_id"> = {
      ...clientData,
      id: new ObjectId().toString(),
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection(COLLECTIONS.clients).insertOne(newClient)
    return {
      ...newClient,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

export async function updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
  try {
    const { db } = await connectToDatabase()
    const updateData = {
      ...clientData,
      updatedAt: new Date().toISOString(),
    }

    const result = await db
      .collection(COLLECTIONS.clients)
      .findOneAndUpdate({ $or: [{ id }, { _id: new ObjectId(id) }] }, { $set: updateData }, { returnDocument: "after" })

    if (!result) return null
    return {
      ...result,
      id: result._id?.toString() || result.id,
    } as Client
  } catch (error) {
    console.error("Error updating client:", error)
    return null
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection(COLLECTIONS.clients).deleteOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })
    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting client:", error)
    return false
  }
}

export async function getClientsByCreator(creatorId: string): Promise<Client[]> {
  try {
    const { db } = await connectToDatabase()
    const clients = await db
      .collection(COLLECTIONS.clients)
      .find({ createdBy: creatorId })
      .sort({ createdAt: -1 })
      .toArray()
    return clients.map((client) => ({
      ...client,
      id: client._id?.toString() || client.id,
    })) as Client[]
  } catch (error) {
    console.error("Error fetching clients by creator:", error)
    return []
  }
}
