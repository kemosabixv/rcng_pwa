import React, { useState } from "react";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Heart, 
  Lightbulb, 
  Users, 
  BookOpen,
  Stethoscope,
  TreePine,
  Building,
  GraduationCap,
  Hammer,
  Shield,
  ArrowRight,
  CheckCircle,
  HandHeart,
  Globe
} from "lucide-react";

interface ServiceArea {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  initiatives: string[];
  impact: {
    metric: string;
    value: string;
  };
  color: string;
}

export function ClubServicePage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const serviceAreas: ServiceArea[] = [
    {
      id: "community-development",
      title: "Community Development",
      description: "Building stronger, more resilient communities through infrastructure and social programs.",
      icon: Building,
      initiatives: [
        "Community center construction and renovation",
        "Road and bridge infrastructure projects",
        "Water and sanitation initiatives",
        "Public space beautification"
      ],
      impact: { metric: "Projects Completed", value: "25+" },
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: "education",
      title: "Education & Literacy",
      description: "Empowering minds through educational support, literacy programs, and scholarship opportunities.",
      icon: GraduationCap,
      initiatives: [
        "Scholarship programs for underprivileged students",
        "Adult literacy classes",
        "Computer and digital literacy training",
        "Library and learning resource centers"
      ],
      impact: { metric: "Students Supported", value: "150+" },
      color: "bg-green-100 text-green-800"
    },
    {
      id: "healthcare",
      title: "Healthcare & Wellness",
      description: "Promoting health and well-being through medical outreach and wellness programs.",
      icon: Stethoscope,
      initiatives: [
        "Free medical camps and health screenings",
        "Maternal and child health programs",
        "Mental health awareness campaigns",
        "Nutrition and wellness education"
      ],
      impact: { metric: "People Served", value: "500+" },
      color: "bg-red-100 text-red-800"
    },
    {
      id: "environment",
      title: "Environmental Conservation",
      description: "Protecting our environment through conservation efforts and sustainable practices.",
      icon: TreePine,
      initiatives: [
        "Tree planting and reforestation projects",
        "Waste management and recycling programs",
        "Clean water conservation initiatives",
        "Environmental education campaigns"
      ],
      impact: { metric: "Trees Planted", value: "1,000+" },
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "youth-empowerment",
      title: "Youth Empowerment",
      description: "Inspiring and equipping young people with skills and opportunities for success.",
      icon: Users,
      initiatives: [
        "Skills training and vocational programs",
        "Youth leadership development",
        "Sports and recreation programs",
        "Mentorship and career guidance"
      ],
      impact: { metric: "Youth Reached", value: "300+" },
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: "poverty-alleviation",
      title: "Poverty Alleviation",
      description: "Creating sustainable solutions to reduce poverty and improve livelihoods.",
      icon: HandHeart,
      initiatives: [
        "Microfinance and small business support",
        "Food security and nutrition programs",
        "Emergency relief and disaster response",
        "Economic empowerment workshops"
      ],
      impact: { metric: "Families Assisted", value: "200+" },
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const rotaryValues = [
    {
      title: "Service Above Self",
      description: "We put the needs of our community before our own interests"
    },
    {
      title: "High Ethical Standards",
      description: "We maintain integrity and honesty in all our endeavors"
    },
    {
      title: "Leadership Development",
      description: "We develop leaders who create positive change"
    },
    {
      title: "Global Perspective",
      description: "We think globally while acting locally"
    }
  ];

  return (
    <>
      <Head>
        <title>Club Service - RCNG</title>
        <meta name="description" content="Discover how Ruiru Central Neighbourhood Association serves our community through various service initiatives and programs." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Club Service
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Making a lasting impact in our community through dedicated service and collaborative action
              </p>
            </div>
          </div>
        </div>

        {/* Our Service Philosophy */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Philosophy</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              As members of the Ruiru Central Neighbourhood Association, we are committed to serving our community 
              with passion, integrity, and a shared vision for positive change.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {rotaryValues.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Areas</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We focus our efforts across multiple areas to create comprehensive positive impact in our community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceAreas.map((area) => {
                const IconComponent = area.icon;
                return (
                  <Card 
                    key={area.id} 
                    className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                      selectedArea === area.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.color}`}>
                            {area.impact.value} {area.impact.metric}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {area.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">
                        {area.description}
                      </p>

                      {selectedArea === area.id && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">Key Initiatives:</h4>
                          <ul className="space-y-2">
                            {area.initiatives.map((initiative, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>{initiative}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArea(selectedArea === area.id ? null : area.id);
                        }}
                      >
                        {selectedArea === area.id ? 'Hide Details' : 'View Details'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Join Us in Making a Difference
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Every act of service, no matter how small, contributes to building a stronger, 
              more vibrant community. Be part of the change you want to see.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Volunteer with Us
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Donate to Our Cause
              </Button>
            </div>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-lg text-gray-600">
                Together, we've achieved remarkable results in our community service efforts.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">2,000+</div>
                <div className="text-gray-600">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Service Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-gray-600">Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
