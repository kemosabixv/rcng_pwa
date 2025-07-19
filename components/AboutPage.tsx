import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Award, Globe, Heart, FileText, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutPage() {
  const pastPresidents = [
    { name: "John Smith", years: "2023-24", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150" },
    { name: "Mary Johnson", years: "2022-23", image: "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?auto=format&fit=crop&w=150&h=150" },
    { name: "Robert Wilson", years: "2021-22", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150" },
    { name: "Sarah Davis", years: "2020-21", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150" }
  ];

  const currentBoard = [
    { name: "Michael Chen", role: "President", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150" },
    { name: "Jennifer Adams", role: "President-Elect", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150" },
    { name: "David Brown", role: "Secretary", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150" },
    { name: "Lisa Martinez", role: "Treasurer", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150" },
    { name: "James Taylor", role: "Sergeant-at-Arms", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150" },
    { name: "Amanda White", role: "Club Service Director", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150" }
  ];


  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-600 text-white">About Us</Badge>
          <h1 className="text-4xl font-bold mb-6">Who We Are</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Founded on the principles of service, fellowship, diversity, integrity, and leadership, 
            our Rotary Club has been serving the community for over 50 years.
          </p>
        </div>

        {/* Mission & Values */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We provide service to others, promote integrity, and advance world understanding, 
                goodwill, and peace through our fellowship of business, professional, and community leaders.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Service</h4>
                    <p className="text-sm text-muted-foreground">Above Self</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fellowship</h4>
                    <p className="text-sm text-muted-foreground">Together</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Diversity</h4>
                    <p className="text-sm text-muted-foreground">Inclusive</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Leadership</h4>
                    <p className="text-sm text-muted-foreground">Excellence</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&h=400"
                alt="Rotary Club meeting"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Past Presidents */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Past Presidents</h2>
            <p className="text-muted-foreground">Honoring the leaders who have guided our club</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastPresidents.map((president, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <ImageWithFallback
                    src={president.image}
                    alt={president.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold mb-1">{president.name}</h3>
                  <p className="text-sm text-muted-foreground">{president.years}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Current Board */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Board of Directors 2024-25</h2>
            <p className="text-muted-foreground">Meet our current leadership team</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBoard.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}