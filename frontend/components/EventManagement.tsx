import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Upload,
  X,
} from "lucide-react";
import { apiClient } from "../utils/api";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  type: string;
  category: string;
  start_date: string;
  end_date: string;
  formatted_start_date: string;
  formatted_end_date: string;
  location: string;
  address: string;
  max_attendees?: number;
  registration_fee: number;
  registration_deadline?: string;
  requires_registration: boolean;
  featured_image?: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  tags: string[];
  notes?: string;
  contact_info?: any;
  creator: {
    id: string;
    name: string;
  };
}

interface EventFormData {
  title: string;
  description: string;
  excerpt: string;
  type: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  max_attendees: string;
  registration_fee: string;
  registration_deadline: string;
  requires_registration: boolean;
  status: string;
  visibility: string;
  is_featured: boolean;
  tags: string;
  notes: string;
  contact_email: string;
  contact_phone: string;
}

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    excerpt: "",
    type: "meeting",
    category: "club_service",
    start_date: "",
    end_date: "",
    location: "",
    address: "",
    max_attendees: "",
    registration_fee: "0",
    registration_deadline: "",
    requires_registration: false,
    status: "draft",
    visibility: "public",
    is_featured: false,
    tags: "",
    notes: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    loadEvents();
  }, [searchTerm, filterStatus, filterType, currentPage]);

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        type: filterType !== "all" ? filterType : undefined,
        page: currentPage,
        per_page: 20,
        sort_by: "start_date",
        sort_order: "desc",
      };

      const response = await apiClient.getEvents(params);

      if (response.success && response.data) {
        setEvents(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      } else {
        setError(response.error || "Failed to load events");
        setEvents([]);
      }
    } catch (err) {
      setError("Failed to load events. Please try again.");
      setEvents([]);
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setError("");
      setSuccess("");

      const eventData = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
        registration_fee: parseFloat(formData.registration_fee) || 0,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [],
        contact_info: {
          email: formData.contact_email || undefined,
          phone: formData.contact_phone || undefined,
        },
      };

      const response = await apiClient.createEvent(eventData);

      if (response.success) {
        setSuccess("Event created successfully!");
        setShowCreateDialog(false);
        resetForm();
        loadEvents();
      } else {
        setError(response.error || "Failed to create event");
      }
    } catch (err) {
      setError("Failed to create event. Please try again.");
      console.error("Error creating event:", err);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      setError("");
      setSuccess("");

      const eventData = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
        registration_fee: parseFloat(formData.registration_fee) || 0,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [],
        contact_info: {
          email: formData.contact_email || undefined,
          phone: formData.contact_phone || undefined,
        },
      };

      const response = await apiClient.updateEvent(editingEvent.id, eventData);

      if (response.success) {
        setSuccess("Event updated successfully!");
        setEditingEvent(null);
        resetForm();
        loadEvents();
      } else {
        setError(response.error || "Failed to update event");
      }
    } catch (err) {
      setError("Failed to update event. Please try again.");
      console.error("Error updating event:", err);
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await apiClient.deleteEvent(event.id);

      if (response.success) {
        setSuccess("Event deleted successfully!");
        loadEvents();
      } else {
        setError(response.error || "Failed to delete event");
      }
    } catch (err) {
      setError("Failed to delete event. Please try again.");
      console.error("Error deleting event:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      excerpt: "",
      type: "meeting",
      category: "club_service",
      start_date: "",
      end_date: "",
      location: "",
      address: "",
      max_attendees: "",
      registration_fee: "0",
      registration_deadline: "",
      requires_registration: false,
      status: "draft",
      visibility: "public",
      is_featured: false,
      tags: "",
      notes: "",
      contact_email: "",
      contact_phone: "",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      excerpt: event.excerpt || "",
      type: event.type,
      category: event.category,
      start_date: event.start_date.slice(0, 16), // Convert to datetime-local format
      end_date: event.end_date.slice(0, 16),
      location: event.location || "",
      address: event.address || "",
      max_attendees: event.max_attendees?.toString() || "",
      registration_fee: event.registration_fee?.toString() || "0",
      registration_deadline: event.registration_deadline?.slice(0, 16) || "",
      requires_registration: event.requires_registration,
      status: event.status,
      visibility: event.visibility,
      is_featured: event.is_featured,
      tags: event.tags?.join(", ") || "",
      notes: event.notes || "",
      contact_email: event.contact_info?.email || "",
      contact_phone: event.contact_info?.phone || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-blue-100 text-blue-800";
      case "service": return "bg-green-100 text-green-800";
      case "fundraiser": return "bg-purple-100 text-purple-800";
      case "social": return "bg-pink-100 text-pink-800";
      case "training": return "bg-orange-100 text-orange-800";
      case "conference": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEvents = events;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Input
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Short description"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Full event description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="fundraiser">Fundraiser</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club_service">Club Service</SelectItem>
                      <SelectItem value="community_service">Community Service</SelectItem>
                      <SelectItem value="international_service">International Service</SelectItem>
                      <SelectItem value="vocational_service">Vocational Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({...formData, max_attendees: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="registration_fee">Registration Fee (KSh)</Label>
                  <Input
                    id="registration_fee"
                    type="number"
                    step="0.01"
                    value={formData.registration_fee}
                    onChange={(e) => setFormData({...formData, registration_fee: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    placeholder="+254 700 123 456"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="meeting, community, fundraiser"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="members_only">Members Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_registration"
                    checked={formData.requires_registration}
                    onCheckedChange={(checked) => setFormData({...formData, requires_registration: checked})}
                  />
                  <Label htmlFor="requires_registration">Requires Registration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="is_featured">Featured Event</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setEditingEvent(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="fundraiser">Fundraiser</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location}
                        </p>
                        {event.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-1">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{event.formatted_start_date}</p>
                        {event.requires_registration && (
                          <p className="text-muted-foreground">
                            Registration required
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {event.visibility.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleEdit(event);
                            setShowCreateDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
