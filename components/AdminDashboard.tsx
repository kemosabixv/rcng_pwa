import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Settings,
  Mail,
  FolderOpen,
  ClipboardList,
  DollarSign,
  PlusCircle,
  Edit,
  Trash2,
  Download,
  Upload,
  Send,
  Eye,
  Search,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  X,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AdminDashboardProps {
  onClose: () => void;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  company: string;
  role: string;
  status: string;
  joinDate: string;
  lastLogin: string | null;
}

interface Committee {
  id: string;
  name: string;
  description: string;
  chairperson: string;
  members: string[];
  meetingSchedule: string;
  budget: number;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  assignedMembers: string[];
  priority: string;
}

interface Due {
  id: string;
  memberId: string;
  amount: number;
  dueDate: string;
  description: string;
  status: string;
  type: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  tags: string[];
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  visibility: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  validUntil: string;
}

interface Analytics {
  members: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  financial: {
    totalDues: number;
    paidDues: number;
    pendingDues: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  // Auth context
  const { user, session } = useAuth();

  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Form states
  const [newCommittee, setNewCommittee] = useState({
    name: "",
    description: "",
    chairperson: "",
    meetingSchedule: "",
    budget: 0,
  });

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: 0,
    startDate: "",
    endDate: "",
    priority: "medium",
  });

  const [newDue, setNewDue] = useState({
    memberId: "",
    amount: 0,
    dueDate: "",
    description: "",
    type: "monthly",
  });

  const [newQuotation, setNewQuotation] = useState({
    clientName: "",
    clientEmail: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    notes: "",
    validUntil: "",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(""); // Clear any previous errors
    try {
      await Promise.all([
        loadMembers(),
        loadCommittees(),
        loadProjects(),
        loadDues(),
        loadDocuments(),
        loadQuotations(),
        loadAnalytics(),
      ]);
      setSuccess("Dashboard loaded successfully. Note: Server backend not available - showing mock data for development. See SETUP_INSTRUCTIONS.md to enable live data.");
    } catch (err) {
      setError("Some data could not be loaded from the server. Showing mock data for development.");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error("No access token found. Please log in.");
    }
    if (!projectId || !publicAnonKey) {
      throw new Error("Supabase project ID or public anon key is not set.");
    }

    // Ensure the endpoint starts with a slash
    if (!endpoint.startsWith("/")) {
      endpoint = `/${endpoint}`;
    }

    const url = `https://${projectId}.supabase.co/functions/v1/make-server-b2be43be${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Unable to parse error response
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const loadMembers = async () => {
    try {
      const data = await makeRequest("/members");
      setMembers(data.members || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for members");
      // Set fallback/mock data for development
      setMembers([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          profession: "Engineer",
          company: "Tech Corp",
          role: "admin",
          status: "active",
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
          profession: "Manager",
          company: "Business Inc",
          role: "member",
          status: "active",
          joinDate: new Date().toISOString(),
          lastLogin: null,
        },
      ]);
    }
  };

  const loadCommittees = async () => {
    try {
      const data = await makeRequest("/committees");
      setCommittees(data.committees || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for committees");
      // Set fallback/mock data for development
      setCommittees([
        {
          id: "1",
          name: "Finance Committee",
          description: "Manages club finances and budgets",
          chairperson: "John Doe",
          members: ["1", "2"],
          meetingSchedule: "Monthly",
          budget: 5000,
          status: "active",
        },
        {
          id: "2",
          name: "Events Committee",
          description: "Organizes club events and activities",
          chairperson: "Jane Smith",
          members: ["2"],
          meetingSchedule: "Bi-weekly",
          budget: 3000,
          status: "active",
        },
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await makeRequest("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for projects");
      // Set fallback/mock data for development
      setProjects([
        {
          id: "1",
          name: "Community Garden",
          description: "Create a community garden for local residents",
          budget: 10000,
          startDate: "2024-01-01",
          endDate: "2024-06-30",
          status: "active",
          progress: 65,
          assignedMembers: ["1", "2"],
          priority: "high",
        },
        {
          id: "2",
          name: "Youth Program",
          description: "Educational program for local youth",
          budget: 7500,
          startDate: "2024-02-01",
          endDate: "2024-08-31",
          status: "active",
          progress: 40,
          assignedMembers: ["2"],
          priority: "medium",
        },
      ]);
    }
  };

  const loadDues = async () => {
    try {
      const data = await makeRequest("/dues");
      setDues(data.dues || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for dues");
      // Set fallback/mock data for development
      setDues([
        {
          id: "1",
          memberId: "1",
          amount: 100,
          dueDate: "2024-03-01",
          description: "Monthly membership dues",
          status: "pending",
          type: "monthly",
        },
        {
          id: "2",
          memberId: "2",
          amount: 50,
          dueDate: "2024-02-15",
          description: "Special assessment",
          status: "paid",
          type: "special",
        },
      ]);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await makeRequest("/documents");
      setDocuments(data.documents || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for documents");
      // Set fallback/mock data for development
      setDocuments([
        {
          id: "1",
          name: "Club Bylaws",
          type: "PDF",
          category: "policy",
          tags: ["governance", "rules"],
          description: "Official club bylaws and regulations",
          uploadedBy: "1",
          uploadedAt: new Date().toISOString(),
          downloadCount: 25,
          visibility: "public",
        },
        {
          id: "2",
          name: "Meeting Minutes - Jan 2024",
          type: "PDF",
          category: "meeting",
          tags: ["minutes", "january"],
          description: "Monthly meeting minutes",
          uploadedBy: "1",
          uploadedAt: new Date().toISOString(),
          downloadCount: 12,
          visibility: "private",
        },
      ]);
    }
  };

  const loadQuotations = async () => {
    try {
      const data = await makeRequest("/quotations");
      setQuotations(data.quotations || []);
    } catch (err) {
      console.log("Server unavailable, using mock data for quotations");
      // Set fallback/mock data for development
      setQuotations([
        {
          id: "1",
          quotationNumber: "QT-001",
          clientName: "City Parks Department",
          clientEmail: "parks@city.gov",
          items: [
            { description: "Garden Design", quantity: 1, price: 2500 },
            { description: "Plant Installation", quantity: 1, price: 1500 },
          ],
          subtotal: 4000,
          tax: 400,
          total: 4400,
          status: "pending",
          validUntil: "2024-04-01",
        },
      ]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await makeRequest("/analytics");
      setAnalytics(data.analytics);
    } catch (err) {
      console.log("Server unavailable, using mock data for analytics");
      // Set fallback/mock data for development
      setAnalytics({
        members: {
          total: 2,
          active: 2,
          inactive: 0,
        },
        projects: {
          total: 2,
          active: 2,
          completed: 0,
        },
        financial: {
          totalDues: 150,
          paidDues: 50,
          pendingDues: 100,
        },
        events: {
          total: 3,
          upcoming: 2,
        },
      });
    }
  };

  const handleCreateCommittee = async () => {
    try {
      setLoading(true);
      await makeRequest("/committees", {
        method: "POST",
        body: JSON.stringify(newCommittee),
      });

      setSuccess("Committee created successfully!");
      setNewCommittee({
        name: "",
        description: "",
        chairperson: "",
        meetingSchedule: "",
        budget: 0,
      });

      await loadCommittees();
    } catch (err) {
      setError("Failed to create committee");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      await makeRequest("/projects", {
        method: "POST",
        body: JSON.stringify(newProject),
      });

      setSuccess("Project created successfully!");
      setNewProject({
        name: "",
        description: "",
        budget: 0,
        startDate: "",
        endDate: "",
        priority: "medium",
      });

      await loadProjects();
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDue = async () => {
    try {
      setLoading(true);
      await makeRequest("/dues", {
        method: "POST",
        body: JSON.stringify(newDue),
      });

      setSuccess("Due created successfully!");
      setNewDue({
        memberId: "",
        amount: 0,
        dueDate: "",
        description: "",
        type: "monthly",
      });

      await loadDues();
    } catch (err) {
      setError("Failed to create due");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = async () => {
    try {
      setLoading(true);
      await makeRequest("/quotations", {
        method: "POST",
        body: JSON.stringify(newQuotation),
      });

      setSuccess("Quotation created successfully!");
      setNewQuotation({
        clientName: "",
        clientEmail: "",
        items: [{ description: "", quantity: 1, price: 0 }],
        notes: "",
        validUntil: "",
      });

      await loadQuotations();
    } catch (err) {
      setError("Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  const addQuotationItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [
        ...newQuotation.items,
        { description: "", quantity: 1, price: 0 },
      ],
    });
  };

  const removeQuotationItem = (index: number) => {
    setNewQuotation({
      ...newQuotation,
      items: newQuotation.items.filter((_, i) => i !== index),
    });
  };

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const updatedItems = newQuotation.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setNewQuotation({
      ...newQuotation,
      items: updatedItems,
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || member.status === filterStatus;
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Admin Dashboard
          </h1>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            <X className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Close Dashboard</span>
          </Button>
        </div>

        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Alert className="mb-4">
          <AlertDescription>
            <strong>Development Mode:</strong> The dashboard is currently showing mock data.
            To use live data, ensure the Supabase Edge Function "make-server-b2be43be" is deployed
            and the KV store table "kv_store_b2be43be" exists in your Supabase project.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            {/* Mobile tabs - dropdown selector */}
            <div className="sm:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Tab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">📊 Overview</SelectItem>
                  <SelectItem value="members">👥 Members</SelectItem>
                  <SelectItem value="committees">🏛️ Committees</SelectItem>
                  <SelectItem value="projects">📋 Projects</SelectItem>
                  <SelectItem value="dues">💰 Dues</SelectItem>
                  <SelectItem value="documents">📄 Documents</SelectItem>
                  <SelectItem value="quotations">📝 Quotations</SelectItem>
                  <SelectItem value="analytics">📈 Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tablet tabs - 4 columns, 2 rows */}
            <div className="hidden sm:grid md:hidden grid-cols-4 gap-1 p-1">
              <TabsList className="grid grid-cols-4 gap-1">
                <TabsTrigger value="overview" className="text-xs p-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="members" className="text-xs p-2">
                  Members
                </TabsTrigger>
                <TabsTrigger value="committees" className="text-xs p-2">
                  Committees
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-xs p-2">
                  Projects
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-4 gap-1 mt-1">
                <TabsTrigger value="dues" className="text-xs p-2">
                  Dues
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs p-2">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="quotations" className="text-xs p-2">
                  Quotations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs p-2">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop tabs - single row */}
            <TabsList className="hidden md:grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="dues">Dues</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.members.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.members.active || 0} active members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.projects.active || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.projects.total || 0} total projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Dues
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.financial.pendingDues || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${analytics?.financial.paidDues || 0} collected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.events.upcoming || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.events.total || 0} total events
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {projects
                      .filter((p) => p.status === "active")
                      .slice(0, 5)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Progress: {project.progress}%
                            </p>
                          </div>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Member Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Members can be added through the signup process or by
                      admin invitation.
                    </p>
                    <Button
                      onClick={() => window.open("/membership", "_blank")}
                    >
                      Open Membership Page
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.profession}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joinDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="committees" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Committee Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Committee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Committee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Committee Name"
                      value={newCommittee.name}
                      onChange={(e) =>
                        setNewCommittee({
                          ...newCommittee,
                          name: e.target.value,
                        })
                      }
                    />
                    <Textarea
                      placeholder="Description"
                      value={newCommittee.description}
                      onChange={(e) =>
                        setNewCommittee({
                          ...newCommittee,
                          description: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Chairperson"
                      value={newCommittee.chairperson}
                      onChange={(e) =>
                        setNewCommittee({
                          ...newCommittee,
                          chairperson: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Meeting Schedule"
                      value={newCommittee.meetingSchedule}
                      onChange={(e) =>
                        setNewCommittee({
                          ...newCommittee,
                          meetingSchedule: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Budget"
                      value={newCommittee.budget}
                      onChange={(e) =>
                        setNewCommittee({
                          ...newCommittee,
                          budget: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Button onClick={handleCreateCommittee} disabled={loading}>
                      {loading ? "Creating..." : "Create Committee"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees.map((committee) => (
                <Card key={committee.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{committee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {committee.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Chairperson:</span>
                        <span className="text-sm font-medium">
                          {committee.chairperson}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Members:</span>
                        <span className="text-sm font-medium">
                          {committee.members.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Budget:</span>
                        <span className="text-sm font-medium">
                          ${committee.budget}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Schedule:</span>
                        <span className="text-sm font-medium">
                          {committee.meetingSchedule}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={getStatusColor(committee.status)}>
                          {committee.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Project Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Project Name"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                    <Textarea
                      placeholder="Description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Budget"
                      value={newProject.budget}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          budget: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="Start Date"
                      value={newProject.startDate}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          startDate: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      value={newProject.endDate}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          endDate: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={newProject.priority}
                      onValueChange={(value) =>
                        setNewProject({ ...newProject, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateProject} disabled={loading}>
                      {loading ? "Creating..." : "Create Project"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>${project.budget}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.progress}%</TableCell>
                        <TableCell>
                          {new Date(project.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dues" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dues Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Due
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Due</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select
                      value={newDue.memberId}
                      onValueChange={(value) =>
                        setNewDue({ ...newDue, memberId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={newDue.amount}
                      onChange={(e) =>
                        setNewDue({
                          ...newDue,
                          amount: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="Due Date"
                      value={newDue.dueDate}
                      onChange={(e) =>
                        setNewDue({ ...newDue, dueDate: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Description"
                      value={newDue.description}
                      onChange={(e) =>
                        setNewDue({ ...newDue, description: e.target.value })
                      }
                    />
                    <Select
                      value={newDue.type}
                      onValueChange={(value) =>
                        setNewDue({ ...newDue, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateDue} disabled={loading}>
                      {loading ? "Creating..." : "Create Due"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dues.map((due) => {
                      const member = members.find((m) => m.id === due.memberId);
                      return (
                        <TableRow key={due.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {member?.name || "Unknown Member"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {due.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>${due.amount}</TableCell>
                          <TableCell>
                            {new Date(due.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{due.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(due.status)}>
                              {due.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Document Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input type="file" />
                    <Input placeholder="Document Name" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="meeting">Meeting Minutes</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="form">Form</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Description" />
                    <Input placeholder="Tags (comma separated)" />
                    <Button>Upload Document</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Type:</span>
                        <span className="text-sm font-medium">
                          {document.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Category:</span>
                        <span className="text-sm font-medium">
                          {document.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Downloads:</span>
                        <span className="text-sm font-medium">
                          {document.downloadCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Uploaded:</span>
                        <span className="text-sm font-medium">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {document.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={getStatusColor(document.visibility)}>
                          {document.visibility}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quotations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Quotation Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Quotation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Quotation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Client Name"
                        value={newQuotation.clientName}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            clientName: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Client Email"
                        value={newQuotation.clientEmail}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            clientEmail: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Items</label>
                      {newQuotation.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-6 gap-2">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="col-span-3"
                          />
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                "quantity",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) =>
                              updateQuotationItem(
                                index,
                                "price",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeQuotationItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addQuotationItem}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Notes"
                      value={newQuotation.notes}
                      onChange={(e) =>
                        setNewQuotation({
                          ...newQuotation,
                          notes: e.target.value,
                        })
                      }
                    />

                    <Input
                      type="date"
                      placeholder="Valid Until"
                      value={newQuotation.validUntil}
                      onChange={(e) =>
                        setNewQuotation({
                          ...newQuotation,
                          validUntil: e.target.value,
                        })
                      }
                    />

                    <Button onClick={handleCreateQuotation} disabled={loading}>
                      {loading ? "Creating..." : "Create Quotation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {quotation.quotationNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {quotation.items.length} items
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {quotation.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {quotation.clientEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>${quotation.total}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(quotation.status)}>
                            {quotation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(quotation.validUntil).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Member Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Members:</span>
                      <span className="font-medium">
                        {analytics?.members.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-medium text-green-600">
                        {analytics?.members.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inactive:</span>
                      <span className="font-medium text-red-600">
                        {analytics?.members.inactive || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Project Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Projects:</span>
                      <span className="font-medium">
                        {analytics?.projects.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-medium text-blue-600">
                        {analytics?.projects.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">
                        {analytics?.projects.completed || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Dues:</span>
                      <span className="font-medium">
                        ${analytics?.financial.totalDues || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collected:</span>
                      <span className="font-medium text-green-600">
                        ${analytics?.financial.paidDues || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium text-orange-600">
                        ${analytics?.financial.pendingDues || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Monthly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart placeholder - Monthly activity trends
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Member Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart placeholder - Member role distribution
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
