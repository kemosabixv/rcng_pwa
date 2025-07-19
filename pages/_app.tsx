import React, { useState } from "react";
import "../styles/globals.css";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { Layout } from "../components/Layout";
import { HomePage } from "../components/HomePage";
import { AboutPage } from "../components/AboutPage";
import { DirectoryPage } from "../components/DirectoryPage";
import { EventsPage } from "../components/EventsPage";
import { BlogPage } from "../components/BlogPage";
import { MembershipPage } from "../components/MembershipPage";
import { ContactPage } from "../components/ContactPage";
import { AdminDashboard } from "../components/AdminDashboard";
import { Button } from "../components/ui/button";
import { Settings, Globe } from "lucide-react";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [language, setLanguage] = useState("en");
  const { user } = useAuth();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleAdminAccess = () => {
    // Check if user has admin role
    setShowAdminDashboard(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
    // In a real app, this would trigger translation system
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onPageChange={handlePageChange} />;
      case "about":
      case "past-presidents":
      case "board":
      case "resources":
        return <AboutPage />;
      case "directory":
        return <DirectoryPage />;
      case "events":
      case "calendar":
      case "projects":
      case "club-service":
        return <EventsPage />;
      case "blog":
        return <BlogPage />;
      case "membership":
        return <MembershipPage />;
      default:
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  if (showAdminDashboard) {
    return <AdminDashboard onClose={() => setShowAdminDashboard(false)} />;
  }

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {/* Admin Access Button for Authenticated Users */}
      {user && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
          <Button
            onClick={toggleLanguage}
            size="sm"
            variant="outline"
            className="bg-white shadow-lg"
          >
            <Globe className="w-4 h-4 mr-2" />
            {language === "en" ? "ES" : "EN"}
          </Button>
          <Button
            onClick={handleAdminAccess}
            size="sm"
            className="bg-primary text-primary-foreground shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      )}
      {renderPage()}
    </Layout>
  );
}

export default function _app() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
