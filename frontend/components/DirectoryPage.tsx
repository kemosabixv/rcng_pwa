import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Search,
  Phone,
  Building2,
  MapPin,
  Loader2,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "./AuthContext";
import { apiClient } from "../utils/api";

interface Member {
  id: string;
  name: string;
  profession?: string;
  company?: string;
  phone?: string;
  created_at: string;
  role: string;
  status: string;
}

export function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, getAccessToken } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.getPublicMembers();

      if (response.success && response.data) {
        // Handle Laravel pagination format
        const membersList = response.data.data || response.data;
        setMembers(Array.isArray(membersList) ? membersList : []);
      } else {
        // If API fails, fall back to mock data for demonstration
        console.warn("API failed, using mock data:", response.error);
        setMembers(mockMembers);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      // Fall back to mock data if API is unavailable
      setMembers(mockMembers);
      setError(""); // Don't show error, just use mock data
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration when API is unavailable
  const mockMembers: Member[] = [
    {
      id: "1",
      name: "Dr. Michael Chen",
      profession: "Physician",
      company: "Nairobi Medical Center",
      created_at: "2018-01-01T00:00:00Z",
      role: "member",
      phone: "+254-700-123-456",
      status: "active",
    },
    {
      id: "2",
      name: "Jennifer Adams",
      profession: "Attorney",
      company: "Adams & Associates Law Firm",
      created_at: "2019-01-01T00:00:00Z",
      role: "member",
      phone: "+254-700-234-567",
      status: "active",
    },
    {
      id: "3",
      name: "David Brown",
      profession: "Financial Advisor",
      company: "Brown Financial Services",
      created_at: "2020-01-01T00:00:00Z",
      role: "member",
      phone: "+254-700-345-678",
      status: "active",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      profession: "Engineer",
      company: "Wilson Engineering Solutions",
      created_at: "2021-01-01T00:00:00Z",
      role: "member",
      phone: "+254-700-456-789",
      status: "active",
    },
    {
      id: "5",
      name: "Robert Johnson",
      profession: "Business Owner",
      company: "Johnson Trading Company",
      created_at: "2020-01-01T00:00:00Z",
      role: "member",
      phone: "+254-700-567-890",
      status: "active",
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.profession || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.company || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            Get to know the dedicated professionals who make up our Rotary Club
            family
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
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
                        new Date(m.created_at).getFullYear();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                      {member.role === "admin"
                        ? "Board Member"
                        : "Active Member"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {member.profession || "No profession listed"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{member.company || "No company listed"}</span>
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
                        Member since {new Date(member.created_at).getFullYear()}
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
