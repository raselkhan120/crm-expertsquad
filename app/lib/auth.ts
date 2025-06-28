export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: "admin" | "user"
  avatar?: string
  createdAt: string
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
  }
}
