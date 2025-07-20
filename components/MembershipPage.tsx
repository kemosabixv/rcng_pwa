import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  CheckCircle,
  Users,
  Calendar,
  Target,
  Heart,
  Globe,
  DollarSign,
  Clock,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function MembershipPage() {
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Professional Networking",
      description:
        "Connect with diverse business and professional leaders in your community",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Service Opportunities",
      description:
        "Make a meaningful impact through local and international service projects",
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Leadership Development",
      description:
        "Develop and enhance your leadership skills through various club roles and projects",
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Global Fellowship",
      description:
        "Join a worldwide network of 1.4 million Rotarians in over 200 countries",
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Weekly Fellowship",
      description:
        "Enjoy regular meetings with inspiring speakers and meaningful connections",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-teal-600" />,
      title: "Personal Growth",
      description:
        "Expand your perspective and grow personally through diverse experiences",
    },
  ];

  const membershipRequirements = [
    "Be at least 18 years of age",
    "Demonstrate high ethical standards in business and profession",
    "Have a good reputation in the community",
    "Be willing to attend weekly meetings regularly",
    "Commit to participating in service projects",
    "Pay annual dues and fees",
  ];

  const membershipTypes = [
    {
      type: "Active Membership",
      description:
        "Full voting membership with all privileges and responsibilities",
      dues: "$200/year",
      includes: [
        "Weekly meeting attendance",
        "Voting rights",
        "Committee participation",
        "Service project involvement",
      ],
    },
    {
      type: "Corporate Membership",
      description: "For businesses wanting to support Rotary's mission",
      dues: "$500/year",
      includes: [
        "Business networking opportunities",
        "Community visibility",
        "CSR partnership",
        "Event sponsorship opportunities",
      ],
    },
    {
      type: "Honorary Membership",
      description:
        "For distinguished individuals who have served the community",
      dues: "By invitation",
      includes: [
        "Meeting attendance",
        "Special recognition",
        "Honorary status",
        "Community appreciation",
      ],
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Badge className="mb-4 bg-red-600 text-white">Membership</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Become a Member
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Join a global community of leaders dedicated to service above self.
            Discover the rewards of Rotary membership and make a lasting impact.
          </p>
        </div>

        {/* Why Join Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join Rotary?</h2>
            <p className="text-muted-foreground">
              Discover the many benefits of Rotary membership
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow text-center"
              >
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-lg mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Membership Process */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Join</h2>
            <p className="text-muted-foreground">
              Your journey to Rotary membership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Express Interest</h3>
              <p className="text-sm text-muted-foreground">
                Fill out our membership inquiry form or contact us directly
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Meet & Greet</h3>
              <p className="text-sm text-muted-foreground">
                Attend a club meeting as our guest to learn more about us
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Apply</h3>
              <p className="text-sm text-muted-foreground">
                Submit your membership application with sponsor recommendation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Welcome!</h3>
              <p className="text-sm text-muted-foreground">
                Join our club and begin your Rotary journey
              </p>
            </div>
          </div>
        </section>

        {/* Membership Types */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Membership Options</h2>
            <p className="text-muted-foreground">
              Choose the membership type that best fits your situation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {membershipTypes.map((membership, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{membership.type}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {membership.dues}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {membership.description}
                  </p>
                  <h4 className="font-semibold mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {membership.includes.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6">Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Membership Requirements
              </h2>
              <p className="text-muted-foreground mb-6">
                Rotary membership is by invitation and requires certain
                qualifications to ensure the integrity and effectiveness of our
                organization.
              </p>
              <ul className="space-y-3">
                {membershipRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&h=400"
                alt="Rotary members"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-muted-foreground">
              Get in touch with us to start your membership journey
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Membership Inquiry Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name
                    </label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input type="email" placeholder="Enter your email address" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input type="tel" placeholder="Enter your phone number" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Profession/Business
                  </label>
                  <Input placeholder="What is your profession or business?" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why are you interested in joining Rotary?
                  </label>
                  <Textarea
                    placeholder="Tell us about your interest in Rotary and what you hope to contribute..."
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  Submit Inquiry
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We'll contact you within 2-3 business days to discuss next
                  steps.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
