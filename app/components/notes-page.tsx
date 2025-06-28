"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Search, Filter, FileText, Calendar, User, Clock } from "lucide-react"
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
import type { Client, User as UserType } from "../lib/data"
import { api } from "../lib/api"

interface Note {
  id: string
  title: string
  content: string
  clientId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
  meetingDate?: string
}

interface NotesPageProps {
  clients: Client[]
  users: UserType[]
  currentUser: UserType | null
}

const NotesPage = ({ clients, users, currentUser }: NotesPageProps) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    clientId: "",
    tags: "",
    meetingDate: "",
  })

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const notesData = await api.getNotes()
      setNotes(notesData)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsLoading(true)
    try {
      const noteData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdBy: currentUser.id,
      }

      if (editingNote) {
        const updatedNote = await api.updateNote(editingNote.id, noteData)
        setNotes((prev) => prev.map((note) => (note.id === editingNote.id ? updatedNote : note)))
      } else {
        const newNote = await api.createNote(noteData)
        setNotes((prev) => [...prev, newNote])
      }

      setShowNoteForm(false)
      setEditingNote(null)
      setFormData({ title: "", content: "", clientId: "", tags: "", meetingDate: "" })
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setIsLoading(true)
    try {
      await api.deleteNote(noteId)
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditForm = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      clientId: note.clientId,
      tags: note.tags.join(", "),
      meetingDate: note.meetingDate || "",
    })
    setShowNoteForm(true)
  }

  const closeForm = () => {
    setShowNoteForm(false)
    setEditingNote(null)
    setFormData({ title: "", content: "", clientId: "", tags: "", meetingDate: "" })
  }

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesClient = clientFilter === "all" || note.clientId === clientFilter
    const matchesUser = userFilter === "all" || note.createdBy === userFilter

    return matchesSearch && matchesClient && matchesUser
  })

  const getClientById = (clientId: string) => {
    return clients.find((client) => client.id === clientId)
  }

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
      <p className="text-gray-500 mb-4">
        {searchTerm || clientFilter !== "all" || userFilter !== "all"
          ? "No notes match your current filters. Try adjusting your search criteria."
          : "Start documenting your client meetings and important information by creating your first note."}
      </p>
      <Button onClick={() => setShowNoteForm(true)} className="bg-green-600 hover:bg-green-700">
        Create First Note
      </Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Notes List */}
      <div className="lg:col-span-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              Notes
            </h2>
            <p className="text-sm text-gray-600 hidden sm:block">Meeting notes and client communications</p>
          </div>
          <Button
            onClick={() => setShowNoteForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Client</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Created By</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setClientFilter("all")
              setUserFilter("all")
            }}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <EmptyState />
          ) : (
            filteredNotes.map((note) => {
              const client = getClientById(note.clientId)
              const creator = getUserById(note.createdBy)
              return (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-colors hover:bg-green-50 ${
                    selectedNote?.id === note.id ? "ring-2 ring-green-500 bg-green-50" : ""
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold truncate">{note.title}</CardTitle>
                      <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEditForm(note)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4 sm:mx-auto">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{note.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(note.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{note.content}</p>
                    <div className="space-y-2">
                      {client && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{client.clientName}</span>
                        </div>
                      )}
                      {note.meetingDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(note.meetingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      {creator && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                            <AvatarFallback className="text-xs">
                              {creator.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">{creator.name}</span>
                        </div>
                      )}
                    </div>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Note Details */}
      <div className="lg:col-span-2 flex flex-col">
        {selectedNote ? (
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold break-words">{selectedNote.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    {(() => {
                      const client = getClientById(selectedNote.clientId)
                      const creator = getUserById(selectedNote.createdBy)
                      return (
                        <>
                          {client && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{client.clientName}</span>
                            </div>
                          )}
                          {selectedNote.meetingDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(selectedNote.meetingDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Created {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                          </div>
                          {creator && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                                <AvatarFallback className="text-xs">
                                  {creator.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>by {creator.name}</span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
                <Button
                  onClick={() => openEditForm(selectedNote)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 ml-4"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap break-words text-gray-700">{selectedNote.content}</div>
              </div>
              {selectedNote.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a note to view</h3>
              <p className="text-gray-500">Choose a note from the list to see its details</p>
            </div>
          </Card>
        )}
      </div>

      {/* Note Form Dialog */}
      {showNoteForm && (
        <Dialog open={true} onOpenChange={closeForm}>
          <DialogContent className="mx-4 sm:mx-auto max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.clientName} - {client.organization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingDate">Meeting Date</Label>
                <Input
                  id="meetingDate"
                  type="datetime-local"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
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
                  {isLoading ? "Saving..." : editingNote ? "Update Note" : "Create Note"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default NotesPage
