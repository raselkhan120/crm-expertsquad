"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClientDetailsPopup } from "./client-details-popup"
import type { Client } from "../lib/data"
import type { User } from "../lib/auth"

interface CalendarViewProps {
  clients: Client[]
  users: User[]
}

export function CalendarView({ clients, users }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getMeetingsForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return clients.filter((client) => {
      const meetingDate = new Date(client.meetingDate)
      return meetingDate.toDateString() === targetDate.toDateString()
    })
  }

  const getSelectedDateMeetings = () => {
    if (!selectedDate) return []
    return clients.filter((client) => {
      const meetingDate = new Date(client.meetingDate)
      return meetingDate.toDateString() === selectedDate.toDateString()
    })
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    // If clicking the same date, deselect it
    if (selectedDate?.toDateString() === clickedDate.toDateString()) {
      setSelectedDate(null)
    } else {
      setSelectedDate(clickedDate)
    }
  }

  const handleClientClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedClient(client)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get upcoming meetings (next 7 days) for the sidebar
  const upcomingMeetings = clients
    .filter((client) => {
      const meetingDate = new Date(client.meetingDate)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return meetingDate >= now && meetingDate <= weekFromNow
    })
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
    .slice(0, 5)

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  const selectedDateMeetings = getSelectedDateMeetings()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square p-2"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const meetings = getMeetingsForDate(day)
                  const isToday =
                    new Date().toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
                  const isSelected =
                    selectedDate?.toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 border rounded-lg cursor-pointer transition-colors relative flex flex-col ${
                        isToday
                          ? "bg-black text-white border-black"
                          : isSelected
                            ? "bg-green-50 border-green-200"
                            : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className={`text-sm font-medium ${
                            isToday ? "text-white" : isSelected ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {day}
                        </div>
                        {isToday && (
                          <div className="text-xs bg-white text-black px-1 py-0.5 rounded font-medium hidden sm:block">
                            Today
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        {meetings.length > 0 && (
                          <div
                            className={`w-2 h-2 rounded-full ${isToday ? "bg-white" : "bg-green-500"}`}
                            title={`${meetings.length} meeting${meetings.length > 1 ? "s" : ""}`}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Meetings */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="h-5 w-5" />
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDateMeetings.length === 0 ? (
                  <p className="text-gray-500 text-sm">No meetings scheduled for this date</p>
                ) : (
                  selectedDateMeetings.map((client) => {
                    const creator = getUserById(client.createdBy || "")
                    return (
                      <div
                        key={client.id}
                        className="border-l-4 border-blue-500 pl-4 py-2 cursor-pointer hover:bg-green-50 rounded-r-lg transition-colors"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="font-medium">{client.clientName}</div>
                        <div className="text-sm text-gray-600">{client.organization}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(client.meetingDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Dhaka",
                          })}
                        </div>
                        <Badge className="mt-2 text-xs">{client.status}</Badge>
                        {creator && (
                          <div className="flex items-center gap-2 mt-2">
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
                    )
                  })
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming meetings scheduled</p>
              ) : (
                upcomingMeetings.map((client) => {
                  const creator = getUserById(client.createdBy || "")
                  return (
                    <div
                      key={client.id}
                      className="border-l-4 border-green-500 pl-4 py-2 cursor-pointer hover:bg-green-50 rounded-r-lg transition-colors"
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="font-medium">{client.clientName}</div>
                      <div className="text-sm text-gray-600">{client.organization}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(client.meetingDate).toLocaleDateString()} at{" "}
                        {new Date(client.meetingDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Dhaka",
                        })}
                      </div>
                      <Badge className="mt-2 text-xs">{client.status}</Badge>
                      {creator && (
                        <div className="flex items-center gap-2 mt-2">
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
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Details Popup */}
      {selectedClient && (
        <ClientDetailsPopup
          client={selectedClient}
          users={users}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            setSelectedClient(null)
            // Note: Edit functionality would need to be passed from parent component
          }}
        />
      )}
    </div>
  )
}
