'use client';

import { useState } from 'react';
import CompressedUpload from '@/app/components/CompressedUpload';
import ChunkedCompressedUpload from '@/app/components/ChunkedCompressedUpload';
import { useRouter } from 'next/navigation';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Info } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();
  const [uploadResult, setUploadResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
    setUploadResult(result);
    setShowSuccess(true);
    
    // After 3 seconds, redirect to slides page
    setTimeout(() => {
      router.push('/dashboard/slides');
    }, 3000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload Slide</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Upload an SVS or NDPI slide file. The file will be compressed before uploading to improve 
          upload speeds. After uploading, the file will be processed to generate Deep Zoom Image tiles for viewing.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Choose the right upload method:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Standard Upload:</strong> For files smaller than 2GB</li>
                  <li><strong>Chunked Upload:</strong> For larger files (2GB-20GB)</li>
                </ul>
                </p>
            </div>
          </div>
                        </div>
                        </div>

      {!showSuccess ? (
        <Tabs className="w-full">
          <TabList className="flex mb-6 border-b">
            <Tab className="px-4 py-2 font-medium focus:outline-none cursor-pointer border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 react-tabs__tab">
              Standard Upload
            </Tab>
            <Tab className="px-4 py-2 font-medium focus:outline-none cursor-pointer border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 react-tabs__tab">
              Large File Upload
            </Tab>
          </TabList>
          
          <TabPanel>
            <CompressedUpload onUploadComplete={handleUploadComplete} />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Best for files smaller than 2GB
            </p>
          </TabPanel>
          
          <TabPanel>
            <ChunkedCompressedUpload onUploadComplete={handleUploadComplete} />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Recommended for files larger than 2GB (up to 20GB)
            </p>
          </TabPanel>
        </Tabs>
      ) : (
        <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your slide has been uploaded and is being processed.</span>
                    </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              <strong>Filename:</strong> {uploadResult?.data?.filename}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Task ID:</strong> {uploadResult?.data?.task_id}
            </p>
                </div>
          
          <p className="text-sm text-gray-500">
            Redirecting to slides page in 3 seconds...
          </p>
                </div>
            )}
        </div>
    );
}