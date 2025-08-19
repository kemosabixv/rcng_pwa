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
  Menu,
  Home,
  Building2,
  Folder,
  Receipt,
  Pen,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../utils/api";
import { BlogManagement } from "./BlogManagement";
import { EventManagement } from "./EventManagement";

interface AdminDashboardProps {}

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

export function AdminDashboard({}: AdminDashboardProps = {}) {
  // Auth context
  const { user, getAccessToken } = useAuth();

  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // Navigation items configuration
  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      description: "Dashboard overview and statistics"
    },
    {
      id: "members", 
      label: "Members",
      icon: Users,
      description: "Member management and directory"
    },
    {
      id: "committees",
      label: "Committees",
      icon: Building2,
      description: "Committee management and structure"
    },
    {
      id: "projects",
      label: "Projects",
      icon: ClipboardList,
      description: "Project tracking and management"
    },
    {
      id: "dues",
      label: "Dues",
      icon: DollarSign,
      description: "Membership dues and payments"
    },
    {
      id: "documents",
      label: "Documents",
      icon: Folder,
      description: "Document library and management"
    },
    {
      id: "quotations",
      label: "Quotations",
      icon: Receipt,
      description: "Vendor quotations and estimates"
    },
    {
      id: "blog",
      label: "Blog",
      icon: Pen,
      description: "Blog management and content"
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      description: "Event management and scheduling"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Reports and analytics dashboard"
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMembers(),
        loadAnalytics(),
      ]);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle API responses
  const handleApiResponse = (response: any) => {
    if (!response.success) {
      throw new Error(response.error || "API request failed");
    }
    return response.data;
  };

  const loadMembers = async () => {
    try {
      const response = await apiClient.getMembers();
      const data = handleApiResponse(response);
      const membersList = data?.data || data || [];
      setMembers(Array.isArray(membersList) ? membersList : []);
    } catch (err) {
      console.error("Failed to load members:", err);
      setMembers([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getAnalytics();
      const data = handleApiResponse(response);

      if (data) {
        const transformedData: Analytics = {
          members: {
            total: data.total_users || 0,
            active: data.active_users || 0,
            inactive: data.inactive_users || 0,
          },
          projects: {
            total: 0,
            active: 0,
            completed: 0,
          },
          financial: {
            totalDues: 0,
            paidDues: 0,
            pendingDues: 0,
          },
          events: {
            total: 0,
            upcoming: 0,
          },
        };
        setAnalytics(transformedData);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setAnalytics(null);
    }
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

  // Render the current content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.members?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.members?.active || 0} active members
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
                    {analytics?.projects?.active || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.projects?.total || 0} total projects
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
                    ${analytics?.financial?.pendingDues || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${analytics?.financial?.paidDues || 0} collected
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
                    {analytics?.events?.upcoming || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.events?.total || 0} total events
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
                    {Array.isArray(members) && members.slice(0, 5).map((member) => (
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
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab("members")}
                    >
                      <Users className="h-6 w-6 mb-1" />
                      <span className="text-sm">Members</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab("blog")}
                    >
                      <Pen className="h-6 w-6 mb-1" />
                      <span className="text-sm">Blog</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab("projects")}
                    >
                      <ClipboardList className="h-6 w-6 mb-1" />
                      <span className="text-sm">Projects</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <BarChart3 className="h-6 w-6 mb-1" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "blog":
        return <BlogManagement />;

      case "events":
        return <EventManagement />;

      case "members":
        return (
          <div className="space-y-4">
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
                      Members can be added through the signup process or by admin invitation.
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(filteredMembers) && filteredMembers.map((member) => (
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
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-lg font-medium">Section Under Development</p>
              <p className="text-muted-foreground">
                The {navigationItems.find(item => item.id === activeTab)?.label} section is coming soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`bg-blue-600 text-white transition-all duration-300 z-20 flex flex-col ${
          sidebarOpen 
            ? 'w-64 fixed md:relative inset-y-0 left-0' 
            : 'w-0 md:w-16 overflow-hidden md:overflow-visible'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-blue-500">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-lg font-bold truncate">Admin Dashboard</h1>
              )}
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-500 p-2"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon || FileText; // Fallback to FileText if icon is undefined
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        <div className="text-xs text-blue-200 truncate">{item.description}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-500">
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              size="sm"
              className="w-full text-white hover:bg-blue-500"
            >
              <Home className={`w-4 h-4 ${sidebarOpen ? 'mr-2' : 'mx-auto'}`} />
              {sidebarOpen && "Back to Site"}
            </Button>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">
                  {navigationItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
              
              {/* Mobile menu button */}
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="outline"
                size="sm"
                className="md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
