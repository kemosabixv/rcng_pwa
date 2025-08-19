import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Share2,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { apiClient } from '../../utils/api';
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
  registration_deadline?: string;
  requires_registration: boolean;
  featured_image?: string;
  gallery?: string[];
  status: string;
  visibility: string;
  is_featured: boolean;
  tags: string[];
  notes?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  is_upcoming: boolean;
  is_past: boolean;
  is_ongoing: boolean;
  registration_status: string;
  creator: {
    id: string;
    name: string;
  };
}

export default function EventDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadEvent(slug);
    }
  }, [slug]);

  const loadEvent = async (eventSlug: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.getPublicEvent(eventSlug);

      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError(response.error || 'Event not found');
      }
    } catch (err) {
      setError('Failed to load event details. Please try again.');
      console.error('Error loading event:', err);
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
    
    const fallbackImages = {
      meeting: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&h=400",
      service: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&h=400",
      fundraiser: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=400",
      social: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&h=400",
      training: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?auto=format&fit=crop&w=800&h=400",
      conference: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=400"
    };
    
    return fallbackImages[event.type as keyof typeof fallbackImages] || fallbackImages.meeting;
  };

  const getRegistrationStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: 'Registration Open',
          color: 'text-green-600'
        };
      case 'closed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          text: 'Registration Closed',
          color: 'text-red-600'
        };
      case 'not_required':
        return {
          icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
          text: 'No Registration Required',
          color: 'text-blue-600'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          text: 'Registration Status Unknown',
          color: 'text-gray-600'
        };
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = event?.title || 'Event';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url);
      alert('Event URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || 'Event not found'}</AlertDescription>
          </Alert>
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const registrationInfo = getRegistrationStatusInfo(event.registration_status);

  return (
    <>
      <Head>
        <title>{event.title} | RCNG Events</title>
        <meta name="description" content={event.excerpt} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.excerpt} />
        <meta property="og:image" content={getEventImage(event)} />
        <meta property="og:type" content="event" />
      </Head>

      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="relative mb-8">
            <ImageWithFallback
              src={getEventImage(event)}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
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
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge variant="outline" className={getCategoryColor(event.category)}>
                  {formatCategoryName(event.category)}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              
              <div className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br />') }} />
              </div>

              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {event.notes && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{event.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {event.formatted_start_date}
                        {event.formatted_end_date && event.formatted_end_date !== event.formatted_start_date && (
                          ` - ${event.formatted_end_date}`
                        )}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        {event.address && (
                          <p className="text-sm text-muted-foreground">{event.address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {event.max_attendees && (
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">
                          Maximum {event.max_attendees} attendees
                        </p>
                      </div>
                    </div>
                  )}

                  {event.registration_fee > 0 && (
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Registration Fee</p>
                        <p className="text-sm text-muted-foreground">
                          KSh {event.registration_fee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.requires_registration && (
                    <div className="flex items-start space-x-3">
                      {registrationInfo.icon}
                      <div>
                        <p className="font-medium">Registration</p>
                        <p className={`text-sm ${registrationInfo.color}`}>
                          {registrationInfo.text}
                        </p>
                        {event.registration_deadline && (
                          <p className="text-xs text-muted-foreground">
                            Deadline: {new Date(event.registration_deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              {event.contact_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.contact_info.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${event.contact_info.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {event.contact_info.email}
                        </a>
                      </div>
                    )}
                    {event.contact_info.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${event.contact_info.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {event.contact_info.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Registration CTA */}
              {event.requires_registration && event.registration_status === 'open' && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Ready to Join?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Register now to secure your spot at this event.
                    </p>
                    <Button className="w-full">
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Organizer */}
              <Card>
                <CardHeader>
                  <CardTitle>Organized by</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{event.creator.name}</p>
                  <p className="text-sm text-muted-foreground">RCNG Member</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
