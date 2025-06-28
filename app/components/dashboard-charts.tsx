"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Client } from "../lib/data"

interface DashboardChartsProps {
  clients: Client[]
}

export function DashboardCharts({ clients }: DashboardChartsProps) {
  // Project Stage Distribution
  const projectStageData = clients.reduce(
    (acc, client) => {
      acc[client.projectStage] = (acc[client.projectStage] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(projectStageData).map(([stage, count]) => ({
    name: stage,
    value: count,
  }))

  // Platform Distribution
  const platformData = clients.reduce(
    (acc, client) => {
      acc[client.freelancePlatform] = (acc[client.freelancePlatform] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const barData = Object.entries(platformData).map(([platform, count]) => ({
    platform,
    clients: count,
  }))

  // Project Value by Stage
  const valueByStage = clients.reduce(
    (acc, client) => {
      if (!acc[client.projectStage]) {
        acc[client.projectStage] = 0
      }
      acc[client.projectStage] += client.projectValue
      return acc
    },
    {} as Record<string, number>,
  )

  const valueData = Object.entries(valueByStage).map(([stage, value]) => ({
    stage,
    value,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Stages Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Project Stages Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Clients by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clients" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Value by Stage */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Project Value by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Value"]} />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
