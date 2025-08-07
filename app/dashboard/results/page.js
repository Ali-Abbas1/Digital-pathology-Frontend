'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

export default function ResultsListPage() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/results`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received results data:', data);

        if (data.status === 'success' && Array.isArray(data.results)) {
          // Sort results by processed date, most recent first
          const sortedResults = data.results.sort((a, b) => {
            return new Date(b.processed_date || 0) - new Date(a.processed_date || 0);
          });
          setResults(sortedResults);
        } else {
          console.error('Invalid data format:', data);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [apiUrl]);

  // Helper to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading results</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Slide Analysis Results</h1>
        <Link 
          href="/dashboard" 
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h2>
          <p className="text-gray-500 mb-4">
            Upload and process slides to see analysis results.
          </p>
          <Link 
            href="/dashboard/upload" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Upload Slide
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((result) => (
            <Link
              key={result.task_id}
              href={`/dashboard/results/${result.task_id}`}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 flex items-center"
            >
              <div className="flex-shrink-0 mr-4">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-800">
                  {result.original_filename || 'Unknown Filename'}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                  <span className="mr-3">Processed: {formatDate(result.processed_date)}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${result.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      result.status === 'failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {result.status}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 