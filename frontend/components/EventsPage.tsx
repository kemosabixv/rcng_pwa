import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MapPin, Clock, Users, Target, Heart, Globe, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function EventsPage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Weekly Club Meeting",
      date: "March 19, 2025",
      time: "12:00 PM - 1:30 PM",
      location: "Downtown Community Center",
      type: "Meeting",
      description: "Regular club meeting with guest speaker Dr. Sarah Johnson on Global Water Crisis Solutions.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&h=200"
    },
    {
      id: 2,
      title: "Community Food Drive",
      date: "March 25, 2025",
      time: "9:00 AM - 4:00 PM",
      location: "City Mall Parking Lot",
      type: "Service",
      description: "Annual food drive to support local food banks. Volunteers needed to collect and sort donations.",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&h=200"
    },
    {
      id: 3,
      title: "Scholarship Fundraiser Gala",
      date: "April 5, 2025",
      time: "6:00 PM - 10:00 PM",
      location: "Grand Hotel Ballroom",
      type: "Fundraiser",
      description: "Annual gala to raise funds for our youth scholarship program. Featuring dinner, auction, and entertainment.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&h=200"
    },
    {
      id: 4,
      title: "Park Cleanup Day",
      date: "April 12, 2025",
      time: "8:00 AM - 12:00 PM",
      location: "Riverside Park",
      type: "Service",
      description: "Join us for our quarterly park cleanup initiative. All supplies provided.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&h=200"
    }
  ];

  const projects = [
    {
      title: "Clean Water Initiative",
      description: "Providing clean water access to underserved communities through well construction and water purification systems.",
      impact: "5,000+ people served",
      status: "Ongoing",
      image: "https://images.unsplash.com/photo-1597149840634-2de02abd9c68?auto=format&fit=crop&w=400&h=200",
      category: "International"
    },
    {
      title: "Youth Scholarship Program",
      description: "Supporting local students with college scholarships and mentorship opportunities.",
      impact: "$50,000 awarded annually",
      status: "Active",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?auto=format&fit=crop&w=400&h=200",
      category: "Education"
    },
    {
      title: "Senior Citizen Support",
      description: "Weekly visits and assistance programs for elderly residents in our community.",
      impact: "200+ seniors supported",
      status: "Weekly",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&h=200",
      category: "Community"
    },
    {
      title: "Literacy Program",
      description: "Teaching reading skills to children and adults in partnership with local libraries.",
      impact: "300+ students tutored",
      status: "Ongoing",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&h=200",
      category: "Education"
    }
  ];

  const clubServices = [
    {
      title: "Membership Development",
      description: "Programs to attract, engage, and retain quality members",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      activities: ["New member orientation", "Mentorship program", "Member appreciation events"]
    },
    {
      title: "Club Administration",
      description: "Efficient club operations and governance",
      icon: <Target className="h-8 w-8 text-green-600" />,
      activities: ["Board meetings", "Financial management", "Strategic planning"]
    },
    {
      title: "Service Projects",
      description: "Organizing and executing community service initiatives",
      icon: <Heart className="h-8 w-8 text-red-600" />,
      activities: ["Project planning", "Volunteer coordination", "Impact measurement"]
    },
    {
      title: "Public Image",
      description: "Promoting Rotary's mission and club activities",
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      activities: ["Social media management", "Community outreach", "PR campaigns"]
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Service': return 'bg-green-100 text-green-800';
      case 'Fundraiser': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'International': return 'bg-red-100 text-red-800';
      case 'Education': return 'bg-blue-100 text-blue-800';
      case 'Community': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-600 text-white">Events</Badge>
          <h1 className="text-4xl font-bold mb-6">Events & Projects</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our upcoming events, ongoing projects, and club service activities
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="calendar" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="club-service">Club Service</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-muted-foreground">Join us for our upcoming meetings and activities</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className={`absolute top-4 left-4 ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>

                    <Button className="w-full">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Projects</h2>
              <p className="text-muted-foreground">Making a difference through meaningful service projects</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className={`absolute top-4 left-4 ${getCategoryColor(project.category)}`}>
                      {project.category}
                    </Badge>
                    <Badge className="absolute top-4 right-4 bg-white text-gray-800">
                      {project.status}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-green-600">{project.impact}</span>
                    </div>

                    <Button variant="outline" className="w-full">
                      Get Involved
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Club Service Tab */}
          <TabsContent value="club-service" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Club Service</h2>
              <p className="text-muted-foreground">How we strengthen our club and serve our members</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {clubServices.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      {service.icon}
                      <span>{service.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Activities:</h4>
                      <ul className="space-y-1">
                        {service.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="text-sm text-muted-foreground flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none max-w-2xl mx-auto">
                <CardContent className="pt-8">
                  <h3 className="text-2xl font-bold mb-4">Want to Get More Involved?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join one of our club service committees and help strengthen our club while developing your leadership skills.
                  </p>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}