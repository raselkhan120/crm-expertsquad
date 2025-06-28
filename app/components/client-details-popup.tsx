"use client"

import type React from "react"

import { useState } from "react"
import { X, Edit, Mail, Phone, ExternalLink, Calendar, DollarSign, Building, UserIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Client } from "../lib/data"
import type { User } from "../lib/auth"

interface ClientDetailsPopupProps {
  client: Client
  users: User[]
  onClose: () => void
  onEdit: () => void
}

export function ClientDetailsPopup({ client, users, onClose, onEdit }: ClientDetailsPopupProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 150)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

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

  const creator = users.find((user) => user.id === client.createdBy)

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-6 transition-all duration-150 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                  {client.clientName}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 break-words">{client.jobTitle}</p>
                <p className="text-base font-medium text-gray-800 break-words">{client.organization}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <Button
                  onClick={onEdit}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button onClick={handleClose} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status and Stage */}
            <div className="flex flex-wrap gap-3">
              <Badge className={`${getStatusColor(client.status)} px-3 py-1`}>{client.status}</Badge>
              <Badge className={`${getProjectStageColor(client.projectStage)} px-3 py-1`}>{client.projectStage}</Badge>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium break-all">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium break-words">{client.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Project Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Project Value</p>
                    <p className="font-medium text-lg">${client.projectValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium break-words">{client.freelancePlatform}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Meeting Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Meeting
              </h3>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">
                    {new Date(client.meetingDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-blue-700">
                    {new Date(client.meetingDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Dhaka",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Description */}
            {client.projectDescription && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{client.projectDescription}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Created By */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Created By</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {creator?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 break-words">{creator?.name || "Unknown User"}</p>
                  <p className="text-sm text-gray-600 break-words">{creator?.email || "No email available"}</p>
                  <p className="text-xs text-gray-500">Created on {new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
