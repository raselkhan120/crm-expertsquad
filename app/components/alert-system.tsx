"use client"

import { useState, useEffect } from "react"
import { Bell, X, Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Client } from "../lib/data"

interface AlertSystemProps {
  clients: Client[]
}

interface Alert {
  id: string
  type: "meeting"
  title: string
  message: string
  client: Client
  urgent: boolean
}

export function AlertSystem({ clients }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const generateAlerts = () => {
      const now = new Date()
      const newAlerts: Alert[] = []

      clients?.forEach((client) => {
        // Meeting reminders
        const meetingDate = new Date(client.meetingDate)
        const timeDiff = meetingDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 3600)
        const daysDiff = timeDiff / (1000 * 3600 * 24)

        // 1 hour before meeting
        if (hoursDiff > 0 && hoursDiff <= 1) {
          newAlerts.push({
            id: `meeting-1h-${client.id}`,
            type: "meeting",
            title: "Meeting in 1 hour",
            message: `Meeting with ${client.clientName} from ${client.organization}`,
            client,
            urgent: true,
          })
        }
        // 1 day before meeting
        else if (daysDiff > 0 && daysDiff <= 1 && hoursDiff > 1) {
          newAlerts.push({
            id: `meeting-1d-${client.id}`,
            type: "meeting",
            title: "Meeting tomorrow",
            message: `Meeting with ${client.clientName} from ${client.organization}`,
            client,
            urgent: false,
          })
        }
      })

      setAlerts(newAlerts)
    }

    generateAlerts()
    const interval = setInterval(generateAlerts, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [clients])

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const urgentAlerts = alerts.filter((alert) => alert.urgent)
  const normalAlerts = alerts.filter((alert) => !alert.urgent)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {alerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No active alerts</p>
            ) : (
              <>
                {urgentAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Urgent
                    </h4>
                    {urgentAlerts.map((alert) => (
                      <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alert.type === "meeting" ? (
                                <Calendar className="h-4 w-4 text-red-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium text-red-800 text-sm">{alert.title}</span>
                            </div>
                            <p className="text-red-700 text-sm">{alert.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {normalAlerts.length > 0 && (
                  <div className="space-y-2">
                    {urgentAlerts.length > 0 && <hr className="my-3" />}
                    <h4 className="text-sm font-medium text-blue-600">Normal</h4>
                    {normalAlerts.map((alert) => (
                      <div key={alert.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alert.type === "meeting" ? (
                                <Calendar className="h-4 w-4 text-blue-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="font-medium text-blue-800 text-sm">{alert.title}</span>
                            </div>
                            <p className="text-blue-700 text-sm">{alert.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
// echo "# crm-expertsquad" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/raselkhan120/crm-expertsquad.git
// git push -u origin main