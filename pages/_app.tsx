import React, { useState } from "react";
import "../styles/globals.css";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { Layout } from "../components/Layout";
import Head from "next/head";
import { Settings, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { AdminDashboard } from "../components/AdminDashboard";

function AppContent({ children }: { children: React.ReactNode }) {

  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [language, setLanguage] = useState("en");
  const { user } = useAuth();

  const handleAdminAccess = () => {
    setShowAdminDashboard(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
    // In a real app, this would trigger translation system
  };

  if (showAdminDashboard) {
    return <AdminDashboard onClose={() => setShowAdminDashboard(false)} />;
  }

  return (
    <Layout>
      {/* Admin Access Button for Authenticated Users */}
      {user && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
          <Button
            onClick={handleAdminAccess}
            size="sm"
            variant="outline"
            className="bg-white shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      )}
      {children}
    </Layout>
  );
}

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AuthProvider>
        <AppContent>
          <Component {...pageProps} />
        </AppContent>
      </AuthProvider>
    </>
  );
}
