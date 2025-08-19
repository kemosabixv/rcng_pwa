import React from "react";
import Head from "next/head";
import { AdminDashboard } from "../components/AdminDashboard";
import { useAuth } from "../components/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated or not admin
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - RCNG</title>
        <meta name="description" content="RCNG Admin Dashboard" />
      </Head>
      <AdminDashboard />
    </>
  );
}
