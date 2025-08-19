import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Briefcase
} from "lucide-react";
import { apiClient } from "../utils/api";

interface Project {
  id: string;
  name: string;
  description: string;
  excerpt?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  category: string;
  location?: string;
  teamMembers: number;
  objectives: string[];
  images?: string[];
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === "all") return true;
    return project.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "planning": return "bg-yellow-100 text-yellow-800";
      case "on-hold": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Community Projects - RCNG</title>
        <meta name="description" content="Explore our community development projects and initiatives making a difference in Ruiru Central." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Community Projects
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Transforming our community through collaborative projects and sustainable development initiatives
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {["all", "active", "completed", "planning", "on-hold"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "All Projects" : status.replace("-", " ")}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "We're working on exciting new projects. Check back soon!" 
                  : `No ${filter.replace("-", " ")} projects available.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {project.progress}% Complete
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 line-clamp-3">
                      {project.excerpt || project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {project.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{project.teamMembers} Team Members</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: KSh {project.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Objectives Preview */}
                    {project.objectives && project.objectives.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Objectives:</p>
                        <ul className="space-y-1">
                          {project.objectives.slice(0, 2).map((objective, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <Target className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                              <span className="line-clamp-1">{objective}</span>
                            </li>
                          ))}
                          {project.objectives.length > 2 && (
                            <li className="text-sm text-gray-500">
                              +{project.objectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <Button className="w-full mt-4" variant="outline">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16 py-12 bg-white rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Involved in Our Projects
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join us in making a difference in our community. Whether through volunteering, 
              funding, or expertise, your contribution matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Volunteer for Projects
              </Button>
              <Button size="lg" variant="outline">
                Contact Us About Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
