import { connectToDatabase } from "../mongodb"
import { COLLECTIONS } from "./schemas"

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    password: "password123",
    role: "admin" as const,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@company.com",
    password: "password123",
    role: "user" as const,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@company.com",
    password: "password123",
    role: "user" as const,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    createdAt: new Date().toISOString(),
  },
]

const mockClients = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    jobTitle: "Marketing Director",
    email: "sarah.johnson@techcorp.com",
    organization: "TechCorp Solutions",
    phoneNumber: "+1 (555) 123-4567",
    freelancePlatform: "LinkedIn",
    projectStage: "In Progress",
    projectValue: 15000,
    status: "Meeting",
    meetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":30",
    nextAction: "Send revised proposal with updated timeline and discuss budget adjustments",
    link: "https://linkedin.com/in/sarahjohnson",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    clientName: "Michael Chen",
    jobTitle: "CEO",
    email: "michael@startupventure.io",
    organization: "StartupVenture",
    phoneNumber: "+1 (555) 987-6543",
    freelancePlatform: "Upwork",
    projectStage: "Proposal Sent",
    projectValue: 8500,
    status: "Follow-up",
    meetingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":00",
    nextAction: "Follow up on proposal status and answer technical questions about implementation",
    link: "https://upwork.com/freelancers/~michaelchen",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    clientName: "Emily Rodriguez",
    jobTitle: "Product Manager",
    email: "emily.r@innovatetech.com",
    organization: "InnovateTech",
    phoneNumber: "+1 (555) 456-7890",
    freelancePlatform: "Direct Contact",
    projectStage: "Completed",
    projectValue: 12000,
    status: "Closed",
    meetingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":15",
    nextAction: "Schedule project review and discuss future opportunities for ongoing maintenance",
    link: "https://innovatetech.com/team/emily",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    clientName: "David Thompson",
    jobTitle: "Operations Manager",
    email: "david.thompson@logistics.com",
    organization: "Global Logistics Inc",
    phoneNumber: "+1 (555) 321-0987",
    freelancePlatform: "Fiverr",
    projectStage: "Initial Talk",
    projectValue: 5500,
    status: "New",
    meetingDate: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":45",
    nextAction: "Prepare initial project scope and cost estimate for logistics optimization system",
    link: "https://fiverr.com/davidthompson",
    createdBy: "3",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    clientName: "Lisa Wang",
    jobTitle: "CTO",
    email: "lisa.wang@fintech.co",
    organization: "FinTech Solutions",
    phoneNumber: "+1 (555) 654-3210",
    freelancePlatform: "Referral",
    projectStage: "In Progress",
    projectValue: 22000,
    status: "Negotiating",
    meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + ":00",
    nextAction: "Present technical architecture and discuss implementation phases for payment gateway integration",
    link: "https://fintech.co/team/lisa-wang",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    clientName: "Robert Kim",
    jobTitle: "Founder",
    email: "robert@ecommerce.shop",
    organization: "E-Commerce Plus",
    phoneNumber: "+1 (555) 789-0123",
    freelancePlatform: "LinkedIn",
    projectStage: "Proposal Sent",
    projectValue: 18500,
    status: "Follow-up",
    meetingDate: new Date().toISOString().slice(0, 16) + ":30",
    nextAction: "Address concerns about project timeline and deliverables for e-commerce platform redesign",
    link: "https://linkedin.com/in/robertkim",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
]

export async function seedDatabase() {
  try {
    const { db } = await connectToDatabase()

    // Check if data already exists
    const userCount = await db.collection(COLLECTIONS.users).countDocuments()
    const clientCount = await db.collection(COLLECTIONS.clients).countDocuments()

    if (userCount === 0) {
      console.log("Seeding users...")
      await db.collection(COLLECTIONS.users).insertMany(mockUsers)
      console.log(`Inserted ${mockUsers.length} users`)
    }

    if (clientCount === 0) {
      console.log("Seeding clients...")
      await db.collection(COLLECTIONS.clients).insertMany(mockClients)
      console.log(`Inserted ${mockClients.length} clients`)
    }

    console.log("Database seeding completed")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
