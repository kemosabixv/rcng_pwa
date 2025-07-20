import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  Loader2,
  Users,
  Shield,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Member {
  id: string;
  email: string;
  name: string;
  profession: string;
  company: string;
  phone: string;
  joinDate: string;
  memberType: string;
  status: string;
}

export function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, getAccessToken } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = getAccessToken();
      if (!accessToken) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b2be43be/members`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch members");
      }

      setMembers(data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration when not authenticated
  const mockMembers = [
    {
      id: "1",
      name: "Michael Chen",
      profession: "Attorney",
      company: "Chen & Associates Law Firm",
      joinDate: "2018",
      memberType: "active",
      email: "michealchen@rotarynairobigigiri.org",
      phone: "(123) 456-7890",
    },
    {
      id: "2",
      name: "Jennifer Adams",
      profession: "Physician",
      company: "Adams Medical Center",
      joinDate: "2019",
      memberType: "active",
      email: "jenniferadams@rotarynairobigigiri.org",
      phone: "(123) 456-7890",
    },
    {
      id: "3",
      name: "David Brown",
      profession: "Financial Advisor",
      company: "Brown Financial Services",
      joinDate: "2020",
      memberType: "active",
      email: "davidbrown@rotarynairobigigiri.org",
      phone: "(123) 456-7890",
    },
  ];

  const filteredMembers = user
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : mockMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.company.toLowerCase().includes(searchTerm.toLowerCase()),
      );

  if (!user) {
    return (
      <div className="min-h-screen py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="mb-4 bg-red-600 text-white">Directory</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Our Members
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Get to know the dedicated professionals who make up our Rotary
              Club family
            </p>
          </div>

          {/* Authentication Required */}
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-8">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Member Access Required
                </h2>
                <p className="text-muted-foreground mb-6">
                  The member directory is available exclusively to registered
                  members. Please sign in to access detailed member information
                  and contact details.
                </p>
                <Alert className="mb-6">
                  <AlertDescription>
                    Below is a preview of our member community. Sign in to view
                    complete profiles and contact information.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Preview Members */}
          <div className="mt-8 sm:mt-12">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                Meet Some of Our Members
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                A glimpse into our diverse professional community
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mockMembers.map((member, index) => (
                <Card key={member.id} className="opacity-75 cursor-not-allowed">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.profession}
                      </p>
                    </div>

                    <div className="space-y-2 opacity-60">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.company}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">••••••@••••.com</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>(•••) •••-••••</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Member since {member.joinDate}
                        </span>
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Protected
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-600 text-white">Directory</Badge>
          <h1 className="text-4xl font-bold mb-6">Our Members</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get to know the dedicated professionals who make up our Rotary Club
            family
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name, profession, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading member directory...</p>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {members.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Members
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {new Set(members.map((m) => m.profession)).size}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Professions Represented
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(
                    members.reduce((acc, m) => {
                      const years =
                        new Date().getFullYear() -
                        new Date(m.joinDate).getFullYear();
                      return acc + years;
                    }, 0) / members.length,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Years Average Membership
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Members Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <Card
                key={member.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-600">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {member.memberType === "admin"
                        ? "Board Member"
                        : "Active Member"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {member.profession}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{member.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {member.email ? member.email : "No email available"}
                      </span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Member since {new Date(member.joinDate).getFullYear()}
                      </span>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No members found matching your search.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-none max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">Join Our Directory</h3>
              <p className="text-muted-foreground mb-6">
                Interested in becoming a member? Connect with our diverse group
                of professionals committed to service and fellowship.
              </p>
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Learn About Membership
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
