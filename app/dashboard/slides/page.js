'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FileText } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';


export default function SlidePage() {
  const router = useRouter()
  const { user } = useAuth();
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
        console.log('Fetching from:', `${apiUrl}/api/slides`);
        
        // const token = Cookies.get('token');
        // if (!token) {
        //   throw new Error('No authentication token found');
        // }

        const response = await fetch(`${apiUrl}/api/slides`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (data.status === 'success' && Array.isArray(data.slides)) {
          setSlides(data.slides);
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

    fetchSlides();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
}

if (error) {
    return (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
                <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading slides</h3>
                    <div className="mt-2 text-sm text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        </div>
    );
}

return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Available Slides</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
                <Link 
                    key={slide.id}
                    href={(`/dashboard/slides/${slide.filename}`)} // Ensure this path is correct
                    className="bg-white border rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 flex items-center hover:cursor-pointer"
                >
                    <FileText className="h-12 w-12 text-indigo-600 mr-4" />
                    <div>
                        <h2 className="font-semibold text-lg">{slide.filename}</h2>
                        <p className="mt-1 text-gray-600">Click to view slide</p>
                    </div>
                </Link>
            ))}
        </div>
    </div>
)
}