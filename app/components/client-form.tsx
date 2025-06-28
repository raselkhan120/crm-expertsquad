"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Client } from "../lib/data"

interface ClientFormProps {
  client?: Client | null
  onSubmit: (client: Omit<Client, "id">) => void
  onClose: () => void
  isLoading?: boolean
}

export function ClientForm({ client, onSubmit, onClose, isLoading = false }: ClientFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    jobTitle: "",
    email: "",
    organization: "",
    phoneNumber: "",
    freelancePlatform: "",
    projectStage: "",
    projectValue: 0,
    status: "",
    meetingDate: "",
    meetingTime: "",
    nextAction: "",
    link: "",
  })

  useEffect(() => {
    if (client) {
      const meetingDateTime = new Date(client.meetingDate)
      const dateStr = meetingDateTime.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
      const timeStr = meetingDateTime.toTimeString().slice(0, 5) // HH:mm format

      setFormData({
        clientName: client.clientName,
        jobTitle: client.jobTitle,
        email: client.email,
        organization: client.organization,
        phoneNumber: client.phoneNumber,
        freelancePlatform: client.freelancePlatform,
        projectStage: client.projectStage,
        projectValue: client.projectValue,
        status: client.status,
        meetingDate: dateStr,
        meetingTime: timeStr,
        nextAction: client.nextAction,
        link: client.link || "",
      })
    }
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Combine meeting date and time
    let combinedMeetingDate = formData.meetingDate
    if (formData.meetingTime) {
      const dateOnly = formData.meetingDate.split("T")[0]
      combinedMeetingDate = `${dateOnly}T${formData.meetingTime}:00`
    }

    const submitData = {
      ...formData,
      meetingDate: combinedMeetingDate,
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freelancePlatform">Freelance Platform</Label>
              <Input
                id="freelancePlatform"
                value={formData.freelancePlatform}
                onChange={(e) => handleChange("freelancePlatform", e.target.value)}
                placeholder="e.g., Upwork, Fiverr, LinkedIn, Direct"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStage">Project Stage</Label>
              <Select value={formData.projectStage} onValueChange={(value) => handleChange("projectStage", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Talk">Initial Talk</SelectItem>
                  <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectValue">Project Value ($)</Label>
              <Input
                id="projectValue"
                type="number"
                value={formData.projectValue}
                onChange={(e) => handleChange("projectValue", Number.parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingDate">Meeting Date</Label>
              <Input
                id="meetingDate"
                type="datetime-local"
                value={formData.meetingDate}
                onChange={(e) => handleChange("meetingDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input
                id="meetingTime"
                type="time"
                value={formData.meetingTime}
                onChange={(e) => handleChange("meetingTime", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Client Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAction">Next Action</Label>
            <Textarea
              id="nextAction"
              value={formData.nextAction}
              onChange={(e) => handleChange("nextAction", e.target.value)}
              placeholder="Describe the next action to take with this client..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : client ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
