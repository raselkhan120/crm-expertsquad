"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Calendar, Users, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientTable } from "./components/client-table"
import { ClientForm } from "./components/client-form"
import { CalendarView } from "./components/calendar-view"
import { DashboardCharts } from "./components/dashboard-charts"
import { AlertSystem } from "./components/alert-system"
import { ClientDetailsPopup } from "./components/client-details-popup"
import { LoginForm } from "./components/login-form"
import SettingsPage from "./components/settings-page"
import { getCurrentUser, logout } from "./lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  fetchUsers,
  fetchClients,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  createClient as apiCreateClient,
  updateClient as apiUpdateClient,
  deleteClient as apiDeleteClient,
  loginUser,
  seedDatabase,
} from "./lib/api"

export default function HomePage() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [recentMeetingFilter, setRecentMeetingFilter] = useState("all")
  const [selectedClient, setSelectedClient] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [creatorFilter, setCreatorFilter] = useState("all")

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      router.push("/dashboard")
    }
  }, [router])

  const loadData = async () => {
    try {
      const [usersData, clientsData] = await Promise.all([fetchUsers(), fetchClients()])

      // If no data exists, seed the database
      if (usersData.length === 0 && clientsData.length === 0) {
        await seedDatabase()
        const [newUsersData, newClientsData] = await Promise.all([fetchUsers(), fetchClients()])
        setUsers(newUsersData)
        setClients(newClientsData)
      } else {
        setUsers(usersData)
        setClients(clientsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleLogin = async (email, password) => {
    const user = await loginUser(email, password)
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      setCurrentUser(user)
      router.push("/dashboard")
      return true
    }
    return false
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  const handleAddUser = async (userData) => {
    const newUser = await apiCreateUser(userData)
    if (newUser) {
      setUsers([...users, newUser])
    }
  }

  const handleEditUser = async (updatedUser) => {
    const result = await apiUpdateUser(updatedUser.id, updatedUser)
    if (result) {
      setUsers(users.map((user) => (user.id === updatedUser.id ? result : user)))
    }
  }

  const handleDeleteUser = async (userId) => {
    const success = await apiDeleteUser(userId)
    if (success) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
  }

  // Filter clients based on search and filters
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesPlatform = platformFilter === "all" || client.freelancePlatform === platformFilter
    const matchesCreator = creatorFilter === "all" || client.createdBy === creatorFilter

    // Recent meeting filter
    let matchesRecentMeeting = true
    if (recentMeetingFilter !== "all") {
      const meetingDate = new Date(client.meetingDate)
      const now = new Date()
      const daysDiff = (now.getTime() - meetingDate.getTime()) / (1000 * 3600 * 24)

      switch (recentMeetingFilter) {
        case "today":
          matchesRecentMeeting = daysDiff >= 0 && daysDiff < 1
          break
        case "week":
          matchesRecentMeeting = daysDiff >= 0 && daysDiff <= 7
          break
        case "month":
          matchesRecentMeeting = daysDiff >= 0 && daysDiff <= 30
          break
        case "upcoming":
          matchesRecentMeeting = daysDiff < 0
          break
      }
    }

    return matchesSearch && matchesStatus && matchesPlatform && matchesCreator && matchesRecentMeeting
  })

  // Dashboard statistics
  const totalClients = clients.length
  const meetingsThisWeek = clients.filter((client) => {
    const meetingDate = new Date(client.meetingDate)
    const now = new Date()

    // Calculate week start (Saturday) and end (Friday)
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1 // Days to go back to Saturday

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToSaturday)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Friday
    weekEnd.setHours(23, 59, 59, 999)

    return meetingDate >= weekStart && meetingDate <= weekEnd
  }).length

  const totalProjectValue = clients
    .filter((client) => client.projectStage !== "Completed")
    .reduce((sum, client) => sum + client.projectValue, 0)

  const handleAddClient = async (clientData) => {
    const newClientData = {
      ...clientData,
      createdBy: currentUser.id,
    }
    const newClient = await apiCreateClient(newClientData)
    if (newClient) {
      setClients([...clients, newClient])
      setShowClientForm(false)
    }
  }

  const handleEditClient = async (clientData) => {
    if (editingClient) {
      const updatedClient = await apiUpdateClient(editingClient.id, clientData)
      if (updatedClient) {
        setClients(clients.map((client) => (client.id === editingClient.id ? updatedClient : client)))
        setEditingClient(null)
        setShowClientForm(false)
      }
    }
  }

  const handleDeleteClient = async (clientId) => {
    const success = await apiDeleteClient(clientId)
    if (success) {
      setClients(clients.filter((client) => client.id !== clientId))
    }
  }

  const openEditForm = (client) => {
    setEditingClient(client)
    setShowClientForm(true)
  }

  const closeForm = () => {
    setShowClientForm(false)
    setEditingClient(null)
  }

  const uniquePlatforms = [...new Set(clients.map((client) => client.freelancePlatform).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600">Manage your clients and projects</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>
            <AlertSystem clients={clients} />
            <Button onClick={() => setShowClientForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClients}</div>
                  <p className="text-xs text-muted-foreground">Active client relationships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meetings This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetingsThisWeek}</div>
                  <p className="text-xs text-muted-foreground">Scheduled meetings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Project Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalProjectValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total value of ongoing projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">Lead to client conversion</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <DashboardCharts clients={clients} />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients, organizations, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {uniquePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={recentMeetingFilter} onValueChange={setRecentMeetingFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by meetings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meetings</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by creator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Creators</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Table */}
            <ClientTable
              clients={filteredClients}
              users={users}
              onEdit={openEditForm}
              onDelete={handleDeleteClient}
              onViewDetails={setSelectedClient}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView clients={clients} users={users} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPage
              currentUser={currentUser}
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>
        </Tabs>

        {/* Client Form Dialog */}
        {showClientForm && (
          <ClientForm
            client={editingClient}
            onSubmit={editingClient ? handleEditClient : handleAddClient}
            onClose={closeForm}
          />
        )}

        {/* Client Details Popup */}
        {selectedClient && (
          <ClientDetailsPopup
            client={selectedClient}
            users={users}
            onClose={() => setSelectedClient(null)}
            onEdit={() => {
              setSelectedClient(null)
              openEditForm(selectedClient)
            }}
          />
        )}
      </main>
    </div>
  )
}
