"use client"

import { useState } from "react"
import { Edit, Trash2, Mail, Phone, ExternalLink, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import type { Client } from "../lib/data"
import type { User } from "../lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ClientTableProps {
  clients: Client[]
  users: User[]
  onEdit: (client: Client) => void
  onDelete: (clientId: string) => void
  onViewDetails: (client: Client) => void
  isLoading?: boolean
}

export function ClientTable({ clients, users, onEdit, onDelete, onViewDetails, isLoading = false }: ClientTableProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800"
      case "Meeting":
        return "bg-purple-100 text-purple-800"
      case "Negotiating":
        return "bg-orange-100 text-orange-800"
      case "Closed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProjectStageColor = (stage: string) => {
    switch (stage) {
      case "Initial Talk":
        return "bg-purple-100 text-purple-800"
      case "Proposal Sent":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-orange-100 text-orange-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
      <p className="text-gray-500 mb-4">
        No clients match your current filters. Try adjusting your search criteria or add a new client.
      </p>
      <Button className="bg-green-600 hover:bg-green-700">Add New Client</Button>
    </div>
  )

  if (clients.length === 0) {
    return <EmptyState />
  }

  if (viewMode === "cards") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">Client Cards</h3>
          <Button variant="outline" onClick={() => setViewMode("table")}>
            Switch to Table View
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
          {clients.map((client) => {
            const creator = users.find((user) => user.id === client.createdBy)
            return (
              <Card
                key={client.id}
                className="hover:shadow-md transition-shadow cursor-pointer hover:bg-green-50"
                onClick={() => onViewDetails(client)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{client.clientName}</CardTitle>
                      <p className="text-sm text-gray-600 truncate">{client.jobTitle}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{client.organization}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails(client)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
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
                            <AlertDialogTitle>Delete Client</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {client.clientName}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(client.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    <Badge className={getProjectStageColor(client.projectStage)}>{client.projectStage}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.freelancePlatform}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Project Value</span>
                      <span className="font-semibold">${client.projectValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Next Meeting</span>
                      <div className="text-right">
                        <div className="text-sm">{new Date(client.meetingDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(client.meetingDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Dhaka",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                        <AvatarFallback className="text-xs bg-green-100 text-green-600">
                          {creator?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 truncate">Created by {creator?.name || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Client Database</h3>
        <Button variant="outline" onClick={() => setViewMode("cards")}>
          Switch to Card View
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="border rounded-lg overflow-hidden min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Client</TableHead>
                <TableHead className="min-w-[200px]">Contact</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Project Stage</TableHead>
                <TableHead className="min-w-[100px]">Platform</TableHead>
                <TableHead className="min-w-[100px]">Value</TableHead>
                <TableHead className="min-w-[140px]">Next Meeting</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
                <TableHead className="min-w-[140px]">Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const creator = users.find((user) => user.id === client.createdBy)
                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-green-50 transition-colors duration-200 border-b border-gray-100"
                    onClick={() => onViewDetails(client)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium break-words">{client.clientName}</div>
                        <div className="text-sm text-gray-600 break-words">{client.jobTitle}</div>
                        <div className="text-sm font-medium text-gray-800 break-words">{client.organization}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm break-all">{client.email}</div>
                        <div className="text-sm text-gray-600">{client.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProjectStageColor(client.projectStage)}>{client.projectStage}</Badge>
                    </TableCell>
                    <TableCell className="break-words">{client.freelancePlatform}</TableCell>
                    <TableCell>${client.projectValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{new Date(client.meetingDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(client.meetingDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Dhaka",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => onViewDetails(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
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
                              <AlertDialogTitle>Delete Client</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {client.clientName}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(client.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                          <AvatarFallback className="text-xs bg-green-100 text-green-600">
                            {creator?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium break-words">{creator?.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
