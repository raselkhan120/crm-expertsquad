import { connectToDatabase } from "../mongodb"
import { COLLECTIONS, type User } from "./schemas"
import { ObjectId } from "mongodb"

export async function getUsers(): Promise<User[]> {
  try {
    const { db } = await connectToDatabase()
    const users = await db.collection(COLLECTIONS.users).find({}).toArray()
    return users.map((user) => ({
      ...user,
      id: user._id?.toString() || user.id,
    })) as User[]
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection(COLLECTIONS.users).findOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })
    if (!user) return null
    return {
      ...user,
      id: user._id?.toString() || user.id,
    } as User
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "id" | "createdAt">): Promise<User> {
  try {
    const { db } = await connectToDatabase()
    const newUser: Omit<User, "_id"> = {
      ...userData,
      id: new ObjectId().toString(),
      password: userData.password || "password123", // Default password
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection(COLLECTIONS.users).insertOne(newUser)
    return {
      ...newUser,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const updateData = {
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    // Only update password if provided
    if (userData.password) {
      updateData.password = userData.password
    }

    const result = await db
      .collection(COLLECTIONS.users)
      .findOneAndUpdate({ $or: [{ id }, { _id: new ObjectId(id) }] }, { $set: updateData }, { returnDocument: "after" })

    if (!result) return null
    return {
      ...result,
      id: result._id?.toString() || result.id,
    } as User
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection(COLLECTIONS.users).deleteOne({
      $or: [{ id }, { _id: new ObjectId(id) }],
    })
    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection(COLLECTIONS.users).findOne({ email })
    if (!user) return null
    return {
      ...user,
      id: user._id?.toString() || user.id,
    } as User
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function getUserByEmailAndPassword(email: string, password: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection(COLLECTIONS.users).findOne({ email, password })
    if (!user) return null
    return {
      ...user,
      id: user._id?.toString() || user.id,
    } as User
  } catch (error) {
    console.error("Error fetching user by email and password:", error)
    return null
  }
}
