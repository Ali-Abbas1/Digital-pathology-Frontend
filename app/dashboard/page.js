'use client';

import Link from 'next/link';
import { 
  FileText, 
  Users, 
  Settings, 
  Upload, 
  BarChart, 
  Activity, 
  PieChart, 
  Calendar,
  BrainCircuit
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [recentUploads, setRecentUploads] = useState(0);
  const [completedAnalyses, setCompletedAnalyses] = useState(0);
  const [pendingAnalyses, setPendingAnalyses] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Simulated data - in a real app, fetch this from your API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
        
        // Fetch slides count
        const slidesResponse = await fetch(`${apiUrl}/api/slides`);
        if (slidesResponse.ok) {
          const slidesData = await slidesResponse.json();
          if (slidesData.status === 'success' && Array.isArray(slidesData.slides)) {
            setTotalSlides(slidesData.slides.length);
          }
        }
        
        // Fetch results stats
        const resultsResponse = await fetch(`${apiUrl}/api/results`);
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          if (resultsData.status === 'success' && Array.isArray(resultsData.results)) {
            const completed = resultsData.results.filter(r => r.status === 'completed').length;
            const pending = resultsData.results.filter(r => r.status !== 'completed' && r.status !== 'failed').length;
            
            setCompletedAnalyses(completed);
            setPendingAnalyses(pending);
            
            // Calculate recent uploads (in the last 7 days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recent = resultsData.results.filter(r => {
              if (!r.processed_date) return false;
              const processDate = new Date(r.processed_date);
              return processDate > oneWeekAgo;
            }).length;
            
            setRecentUploads(recent);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Digital Pathology Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your slide analysis and pathology workflow</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Slides</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : totalSlides}
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-gray-500">
              Available for viewing
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Analyses</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {loading ? '...' : completedAnalyses}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-gray-500">
              Slide analyses with results
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Analyses</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {loading ? '...' : pendingAnalyses}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-gray-500">
              Analyses in progress
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {loading ? '...' : recentUploads}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-gray-500">
              In the past 7 days
            </div>
          </div>
        </div>
        
        {/* Main action cards */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <Link href="/dashboard/slides" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="font-semibold text-lg ml-3 text-gray-800">View Slides</h2>
            </div>
            <p className="text-gray-600">Browse and view all available digital pathology slides in the database.</p>
            <div className="mt-4 text-indigo-600 text-sm font-medium group-hover:underline">
              View all slides →
            </div>
          </Link>

          <Link href="/dashboard/results" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-4">
              <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="font-semibold text-lg ml-3 text-gray-800">Analysis Results</h2>
            </div>
            <p className="text-gray-600">View AI-generated heatmaps and diagnostic analysis for processed slides.</p>
            <div className="mt-4 text-purple-600 text-sm font-medium group-hover:underline">
              View results →
            </div>
          </Link>

          <Link href="/dashboard/upload" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="font-semibold text-lg ml-3 text-gray-800">Upload Slides</h2>
            </div>
            <p className="text-gray-600">Upload new slides for viewing or AI analysis with compression support.</p>
            <div className="mt-4 text-blue-600 text-sm font-medium group-hover:underline">
              Upload new slides →
            </div>
          </Link>
        </div>
        
        {/* Secondary action cards */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link href="/dashboard/users" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-800">Manage Users</h2>
              <p className="text-sm text-gray-600 mt-1">User access and permissions</p>
            </div>
          </Link>

          <Link href="/dashboard/settings" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-800">System Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Configure application behavior</p>
            </div>
          </Link>
          
          <Link href="/dashboard/calendar" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex items-center">
            <div className="bg-red-50 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-800">Calendar</h2>
              <p className="text-sm text-gray-600 mt-1">Schedule and appointments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}