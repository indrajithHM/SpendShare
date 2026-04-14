"use client";
import { useAuth } from "@/hooks/useAuth";
import GoogleLogin from "@/components/GoogleLogin";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

export default function HomeClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!user) return <GoogleLogin />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <Dashboard />
    </div>
  );
}
