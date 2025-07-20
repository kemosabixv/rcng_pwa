import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Target,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Link from "next/link";

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export function HomePage({ onPageChange }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Rotary Club of Nairobi Gigiri",
      subtitle: "Service Above Self",
      description:
        "Join us in making a positive impact in our community and around the world through service, friendship, and professional development.",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&h=600",
      cta: "Learn More About Us",
      ctaHref: "/about",
    },
    {
      title: "Make a Difference Today",
      subtitle: "Community Service",
      description:
        "From local food drives to international water projects, we're committed to creating lasting change through meaningful service.",
      image:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&h=600",
      cta: "View Our Projects",
      ctaHref: "/projects",
    },
    {
      title: "Join Our Fellowship",
      subtitle: "Become a Member",
      description:
        "Connect with like-minded professionals who share your passion for service and making a positive impact.",
      image:
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&h=600",
      cta: "Become a Member",
      ctaHref: "/membership",
    },
  ];

  const speakers = [
    {
      name: "Dr. Sarah Johnson",
      topic: "Global Water Crisis Solutions",
      date: "March 15, 2025",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?auto=format&fit=crop&w=150&h=150",
    },
    {
      name: "Mark Thompson",
      topic: "Community Economic Development",
      date: "March 22, 2025",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
    },
    {
      name: "Prof. Lisa Chen",
      topic: "Youth Leadership Programs",
      date: "March 29, 2025",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
    },
  ];

  const goals = [
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Promote Peace",
      description:
        "Foster understanding and peaceful relationships between communities worldwide.",
    },
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Fight Disease",
      description:
        "Work to prevent and treat diseases while improving access to healthcare.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Support Education",
      description:
        "Increase literacy rates and expand access to quality education for all.",
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Grow Local Economies",
      description:
        "Create opportunities for economic and community development.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Slider */}
      <section className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <ImageWithFallback
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl px-4">
                  <Badge
                    className="mb-4 text-white"
                    style={{ backgroundColor: "#1a73eb" }}
                  >
                    {slide.subtitle}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                    {slide.description}
                  </p>
                  <Link href={slide.ctaHref}>
                    <Button
                      size="lg"
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: "#1a73eb" }}
                    >
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-16">
            {/* Four-Way Test */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">The Four-Way Test</h2>
                <p className="text-muted-foreground">
                  Of the things we think, say or do
                </p>
              </div>
              <div
                className="text-white p-8 rounded-lg"
                style={{ backgroundColor: "#f89c13" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        1
                      </span>
                      <span>Is it the TRUTH?</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        2
                      </span>
                      <span>Is it FAIR to all concerned?</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        3
                      </span>
                      <span>
                        Will it build GOODWILL and BETTER FRIENDSHIPS?
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        4
                      </span>
                      <span>Will it be BENEFICIAL to all concerned?</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Yearly Theme */}
            <section className="text-center">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
                <CardContent className="pt-8 mb-px">
                  <h2 className="text-3xl font-bold mb-4">2024-25 Theme</h2>
                  <h3 className="text-2xl text-blue-600 mb-6">
                    "The Magic of Rotary"
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    This year we focus on the transformative power of Rotary's
                    service, creating positive change through our collective
                    efforts and dedication.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Where and When We Meet CTA */}
            <section>
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">
                      Join Us for Our Weekly Meetings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="flex items-center justify-center space-x-3">
                        <Calendar className="h-6 w-6 text-red-600" />
                        <span>Every Tuesday at 12:00 PM</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <MapPin className="h-6 w-6 text-red-600" />
                        <span>Downtown Community Center</span>
                      </div>
                    </div>
                    <Link href="/contact">
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        Get Directions & RSVP
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Goals of Rotary */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Areas of Focus</h2>
                <p className="text-muted-foreground">
                  Rotary's commitment to creating positive change
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {goals.map((goal, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">{goal.icon}</div>
                        <div>
                          <h3 className="font-semibold mb-2">{goal.title}</h3>
                          <p className="text-muted-foreground">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* The Rotary Foundation */}
            <section>
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">
                      The Rotary Foundation
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                      Our Foundation enables Rotarians to advance world
                      understanding, goodwill, and peace through the improvement
                      of health, the support of education, and the alleviation
                      of poverty.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          $4B+
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Invested in communities
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          100+
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Countries served
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          2.5B+
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Children protected from polio
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() =>
                        window.open(
                          "https://www.rotary.org/en/about-rotary/rotary-foundation",
                          "_blank",
                        )
                      }
                    >
                      Learn More About TRF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Speaker Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Upcoming Speakers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {speakers.map((speaker, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start space-x-3">
                      <ImageWithFallback
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {speaker.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {speaker.topic}
                        </p>
                        <p className="text-xs" style={{ color: "#254998" }}>
                          {speaker.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/events">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Speakers
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
