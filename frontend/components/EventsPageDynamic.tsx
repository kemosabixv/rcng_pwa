import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar, MapPin, Clock, Users, Search, Filter, ArrowRight, CalendarDays } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiClient } from '../utils/api';
import Link from 'next/link';

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
  requires_registration: boolean;
  featured_image?: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  tags: string[];
  contact_info?: any;
  is_upcoming: boolean;
  is_past: boolean;
  is_ongoing: boolean;
  registration_status: string;
  creator: {
    id: string;
    name: string;
  };
}

interface EventsResponse {
  data: Event[];
  current_page: number;
  last_page: number;
  total: number;
}

export function EventsPageDynamic() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEvents();
  }, [searchTerm, filterType, filterCategory, timeframe, currentPage]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        search: searchTerm || undefined,
        type: filterType !== 'all' ? filterType : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        timeframe: timeframe,
        page: currentPage,
        per_page: 12,
        sort_by: 'start_date',
        sort_order: 'asc'
      };

      const response = await apiClient.getPublicEvents(params);

      if (response.success && response.data) {
        const eventsData = response.data as EventsResponse;
        setEvents(eventsData.data || []);
        setTotalPages(eventsData.last_page || 1);
      } else {
        setError(response.error || 'Failed to load events');
        setEvents([]);
      }
    } catch (err) {
      console.error('Error loading events:', err);

      // Check if it's a connection error and provide fallback data
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Backend server is not available. Showing demo events.');
        // Provide some demo events as fallback
        setEvents([
          {
            id: '1',
            title: 'Weekly Rotary Meeting',
            description: 'Join us for our regular weekly meeting with fellow Rotarians',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            location: 'Trademark Village Market, Limuru Rd',
            event_type: 'meeting',
            category: 'regular',
            slug: 'weekly-rotary-meeting',
            is_featured: true,
            featured_image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&h=400',
            registration_required: false,
            max_participants: null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Community Service Project',
            description: 'Help us make a difference in our local community',
            start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            location: 'Community Center',
            event_type: 'service',
            category: 'community',
            slug: 'community-service-project',
            is_featured: false,
            featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&h=400',
            registration_required: true,
            max_participants: 50,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
        setTotalPages(1);
      } else {
        setError('Failed to load events. Please try again.');
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'fundraiser': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      case 'conference': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'club_service': return 'bg-blue-100 text-blue-800';
      case 'community_service': return 'bg-green-100 text-green-800';
      case 'international_service': return 'bg-red-100 text-red-800';
      case 'vocational_service': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getEventImage = (event: Event) => {
    if (event.featured_image) {
      return `/api/storage/${event.featured_image}`;
    }
    
    // Fallback images based on event type
    const fallbackImages = {
      meeting: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&h=200",
      service: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&h=200",
      fundraiser: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&h=200",
      social: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&h=200",
      training: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?auto=format&fit=crop&w=400&h=200",
      conference: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&h=200"
    };
    
    return fallbackImages[event.type as keyof typeof fallbackImages] || fallbackImages.meeting;
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-600 text-white">Events</Badge>
          <h1 className="text-4xl font-bold mb-6">Events & Activities</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us for meaningful events that bring our community together and make a difference
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
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

              {/* Timeframe Filter */}
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
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

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="club_service">Club Service</SelectItem>
                  <SelectItem value="community_service">Community Service</SelectItem>
                  <SelectItem value="international_service">International Service</SelectItem>
                  <SelectItem value="vocational_service">Vocational Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new events.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <ImageWithFallback
                          src={getEventImage(event)}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className={getEventTypeColor(event.type)}>
                            {formatTypeName(event.type)}
                          </Badge>
                          {event.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {event.registration_fee > 0 && (
                          <Badge className="absolute top-4 right-4 bg-white text-gray-800">
                            KSh {event.registration_fee}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-3">
                          <Badge variant="outline" className={getCategoryColor(event.category)}>
                            {formatCategoryName(event.category)}
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{event.excerpt}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.formatted_start_date}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                          )}
                          {event.max_attendees && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              Max {event.max_attendees} attendees
                            </div>
                          )}
                        </div>

                        <Link href={`/events/${event.slug}`}>
                          <Button className="w-full">
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
