'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

const Dashboard = ({ slides }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Available Slides</h2>
      </div>
      
      <div className="p-6">
        {slides.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No slides available</h3>
            <p className="mt-1 text-sm text-gray-500">No slides found in the directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map(slide => (
              <Link 
                key={slide.id}
                href={`/dashboard/slides/${slide.filename}`}
                className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                    {slide.filename}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click to view slide
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;