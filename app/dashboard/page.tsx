"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Calendar,
  Users,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Home,
  StickyNote,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { DashboardCharts } from "../components/dashboard-charts"
import { CalendarView } from "../components/calendar-view"
import { ClientTable } from "../components/client-table"
import { ClientForm } from "../components/client-form"
import { ClientDetailsPopup } from "../components/client-details-popup"
import { NotesPage } from "../components/notes-page"
import SettingsPage from "../components/settings-page"
import { AlertSystem } from "../components/alert-system"
import type { Client, User } from "../lib/data"
import { api } from "../lib/api"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [alerts, setAlerts] = useState<Array<{ id: string; type: "success" | "error"; message: string }>>([])

  // Load data on component mount
  useEffect(() => {
    loadData()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        setCurrentUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error loading current user:", error)
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [clientsData, usersData] = await Promise.all([api.getClients(), api.getUsers()])
      setClients(clientsData)
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading data:", error)
      showAlert("error", "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const showAlert = (type: "success" | "error", message: string) => {
    const id = Date.now().toString()
    setAlerts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    }, 5000)
  }

  const handleAddClient = async (clientData: Omit<Client, "id" | "createdAt">) => {
    setIsLoading(true)
    try {
      const newClient = await api.createClient({
        ...clientData,
        createdBy: currentUser?.id || "",
      })
      setClients((prev) => [...prev, newClient])
      setShowClientForm(false)
      showAlert("success", "Client added successfully")
    } catch (error) {
      console.error("Error adding client:", error)
      showAlert("error", "Failed to add client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClient = async (clientData: Client) => {
    setIsLoading(true)
    try {
      const updatedClient = await api.updateClient(clientData.id, clientData)
      setClients((prev) => prev.map((client) => (client.id === clientData.id ? updatedClient : client)))
      setEditingClient(null)
      setShowClientForm(false)
      showAlert("success", "Client updated successfully")
    } catch (error) {
      console.error("Error updating client:", error)
      showAlert("error", "Failed to update client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    setIsLoading(true)
    try {
      await api.deleteClient(clientId)
      setClients((prev) => prev.filter((client) => client.id !== clientId))
      showAlert("success", "Client deleted successfully")
    } catch (error) {
      console.error("Error deleting client:", error)
      showAlert("error", "Failed to delete client")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (userData: Omit<User, "id" | "createdAt">) => {
    setIsLoading(true)
    try {
      const newUser = await api.createUser(userData)
      setUsers((prev) => [...prev, newUser])
      showAlert("success", "User added successfully")
    } catch (error) {
      console.error("Error adding user:", error)
      showAlert("error", "Failed to add user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async (userData: User) => {
    setIsLoading(true)
    try {
      const updatedUser = await api.updateUser(userData.id, userData)
      setUsers((prev) => prev.map((user) => (user.id === userData.id ? updatedUser : user)))
      showAlert("success", "User updated successfully")
    } catch (error) {
      console.error("Error updating user:", error)
      showAlert("error", "Failed to update user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true)
    try {
      await api.deleteUser(userId)
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      showAlert("success", "User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      showAlert("error", "Failed to delete user")
    } finally {
      setIsLoading(false)
    }
  }

  const openEditForm = (client: Client) => {
    setEditingClient(client)
    setShowClientForm(true)
  }

  const closeForm = () => {
    setShowClientForm(false)
    setEditingClient(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }

  // Filter clients based on search and filters
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesStage = stageFilter === "all" || client.projectStage === stageFilter

    return matchesSearch && matchesStatus && matchesStage
  })

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "clients", label: "Clients", icon: Users },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "clients", label: "Clients", icon: Users },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardCharts clients={clients} users={users} />
      case "clients":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Client Management</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Manage your client relationships and projects</p>
              </div>
              <Button
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Negotiating">Negotiating</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Project Stage</Label>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Initial Talk">Initial Talk</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Actions</Label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setStageFilter("all")
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            <ClientTable
              clients={filteredClients}
              users={users}
              onEdit={openEditForm}
              onDelete={handleDeleteClient}
              onViewDetails={setSelectedClient}
              isLoading={isLoading}
            />
          </div>
        )
      case "calendar":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-600 hidden sm:block">View and manage your meetings and appointments</p>
            </div>
            <CalendarView clients={clients} users={users} />
          </div>
        )
      case "notes":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Manage your meeting notes and client communications
              </p>
            </div>
            <NotesPage clients={clients} users={users} currentUser={currentUser} />
          </div>
        )
      case "settings":
        return (
          <SettingsPage
            currentUser={currentUser!}
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            isLoading={isLoading}
          />
        )
      default:
        return <DashboardCharts clients={clients} users={users} />
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertSystem alerts={alerts} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col sidebar-bg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-lg font-bold sidebar-text">CRM - Expert Squad</h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? "bg-green-700 sidebar-text"
                        : "sidebar-text hover:bg-green-700 hover:bg-opacity-75"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-green-700 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium sidebar-text">{currentUser.name}</p>
                  <p className="text-xs text-green-200">{currentUser.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="sidebar-text hover:bg-green-700 hover:bg-opacity-75"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col sidebar-bg">
            <div className="flex min-h-0 flex-1 flex-col pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center justify-between px-4">
                <h1 className="text-lg font-bold sidebar-text">CRM - Expert Squad</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="sidebar-text hover:bg-green-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id)
                        setIsSidebarOpen(false)
                      }}
                      className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        currentView === item.id
                          ? "bg-green-700 sidebar-text"
                          : "sidebar-text hover:bg-green-700 hover:bg-opacity-75"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-green-700 p-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium sidebar-text">{currentUser.name}</p>
                    <p className="text-xs text-green-200">{currentUser.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="sidebar-text hover:bg-green-700 hover:bg-opacity-75"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex h-12 sm:h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 capitalize">{currentView}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{renderContent()}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-nav-fixed lg:hidden bg-white border-t border-gray-200 safe-area-pb">
          <div className="grid grid-cols-5 h-16">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                    currentView === item.id
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Client Form Dialog */}
      {showClientForm && (
        <Dialog open={true} onOpenChange={closeForm}>
          <DialogContent className="mx-4 sm:mx-auto max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <ClientForm
              client={editingClient}
              onSubmit={editingClient ? handleEditClient : handleAddClient}
              onCancel={closeForm}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Client Details Popup */}
      {selectedClient && (
        <ClientDetailsPopup
          client={selectedClient}
          users={users}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            openEditForm(selectedClient)
            setSelectedClient(null)
          }}
        />
      )}
    </div>
  )
}
