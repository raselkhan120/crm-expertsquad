"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Users, Settings, Eye, EyeOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { User } from "../lib/auth"

interface SettingsPageProps {
  currentUser: User
  users: User[]
  onAddUser: (user: Omit<User, "id" | "createdAt">) => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  isLoading?: boolean
}

const SettingsPage = ({
  currentUser,
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  isLoading = false,
}: SettingsPageProps) => {
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    avatar: "",
  })

  // Remove the existing useEffect with interval and replace with:
  useEffect(() => {
    // This component will receive fresh data from parent via props
    // No need for additional polling here since parent handles it
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = { ...formData }

    // If editing and password is empty, don't include password in update
    if (editingUser && !formData.password) {
      delete submitData.password
    }

    if (editingUser) {
      // Pass the complete user object with updated data
      await onEditUser({
        ...editingUser,
        ...submitData,
        id: editingUser.id, // Ensure ID is preserved
      })
    } else {
      await onAddUser(submitData)
    }

    setShowUserForm(false)
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "user", avatar: "" })
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show existing password
      role: user.role,
      avatar: user.avatar || "",
    })
    setShowUserForm(true)
  }

  const closeForm = () => {
    setShowUserForm(false)
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "user", avatar: "" })
    setShowPassword(false)
  }

  const canManageUsers = currentUser.role === "admin"

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-500 mb-4">No users are currently in the system. Add your first user to get started.</p>
      {canManageUsers && (
        <Button onClick={() => setShowUserForm(true)} className="bg-green-600 hover:bg-green-700">
          Add First User
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
            Settings
          </h2>
          <p className="text-sm text-gray-600 hidden sm:block">Manage users and system settings</p>
        </div>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            {canManageUsers && (
              <Button
                onClick={() => setShowUserForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!canManageUsers ? (
            <p className="text-gray-500">You don't have permission to manage users.</p>
          ) : users.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <div className="border rounded-lg overflow-hidden min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">User</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[100px]">Role</TableHead>
                      <TableHead className="min-w-[120px]">Created</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-green-50 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium break-words">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-all">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditForm(user)} disabled={isLoading}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.id !== currentUser.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" disabled={isLoading}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4 sm:mx-auto">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteUser(user.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      {showUserForm && (
        <Dialog open={true} onOpenChange={closeForm}>
          <DialogContent className="mx-4 sm:mx-auto max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUser}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {editingUser && <p className="text-xs text-gray-500">Leave blank to keep current password</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
                {formData.avatar && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Preview" />
                      <AvatarFallback>
                        {formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Preview</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  {isLoading ? "Saving..." : editingUser ? "Update User" : "Add User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SettingsPage
