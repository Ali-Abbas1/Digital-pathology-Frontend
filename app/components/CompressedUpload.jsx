'use client';

import { useState, useRef, useEffect } from 'react';
import { gzip } from 'fflate';
import { Upload, FileUp, ToggleLeft, ToggleRight } from 'lucide-react'; 

// Define a worker for compression
const createCompressionWorker = () => {
  const workerCode = `
    self.importScripts('https://unpkg.com/fflate@0.8.2/umd/index.js');
    
    self.onmessage = function(e) {
      const { fileData, compressionLevel } = e.data;
      
      self.fflate.gzip(fileData, { level: compressionLevel || 6 }, (err, compressed) => {
        if (err) {
          self.postMessage({ error: err.message });
        } else {
          self.postMessage({ compressed });
        }
      });
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export default function CompressedUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [useCompression, setUseCompression] = useState(true);
  const [stage, setStage] = useState('idle'); // idle, reading, compressing, uploading, complete
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);
  const uploadStartTimeRef = useRef(null);
  const [uploadStats, setUploadStats] = useState({
    startTime: null,
    endTime: null,
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0
  });

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setProgress(0);
      setStage('idle');
    }
  };

  const processAndUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      uploadStartTimeRef.current = Date.now();
      
      // Read the file
      setStage('reading');
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      setProgress(10);

      let dataToUpload;
      let fileName = file.name;
      
      if (useCompression) {
        // Compress using worker
        setStage('compressing');
        const worker = createCompressionWorker();
        workerRef.current = worker;
        
        const compressedData = await new Promise((resolve, reject) => {
          worker.onmessage = (event) => {
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else {
              resolve(event.data.compressed);
            }
          };
          worker.onerror = (error) => {
            reject(error);
          };
          
          // Post message to worker
          worker.postMessage({
            fileData,
            compressionLevel: 6
          });
        });
        
        setProgress(40);
        
        // Create blob from compressed data
        dataToUpload = new Blob([compressedData], { type: 'application/gzip' });
        fileName = `${file.name}.gz`;
        
        // Update compression stats
        setUploadStats({
          ...uploadStats,
          originalSize: file.size,
          compressedSize: compressedData.length,
          compressionRatio: ((file.size - compressedData.length) / file.size * 100).toFixed(1)
        });
        
        // Clean up worker
        worker.terminate();
        workerRef.current = null;
      } else {
        // Use uncompressed file
        dataToUpload = file;
        setProgress(30);
      }

      // Start uploading
      setStage('uploading');
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', dataToUpload, fileName);
      formData.append('originalName', file.name);
      formData.append('compressed', useCompression ? 'true' : 'false');

      // Get API URL from environment variable or default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';

      // Add upload progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiUrl}/api/upload`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Calculate progress including compression steps
          const uploadProgress = event.loaded / event.total;
          // Adjust progress: compression is 0-40%, upload is 40-100%
          const adjustedProgress = useCompression 
            ? 40 + (uploadProgress * 60) 
            : 30 + (uploadProgress * 70);
          setProgress(Math.round(adjustedProgress));
        }
      };
      
      // Upload with XHR to track progress
      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      // Complete
      setStage('complete');
      setProgress(100);
      setUploadStats({
        ...uploadStats,
        endTime: Date.now(),
      });

      // Reset form state
      setTimeout(() => {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(response);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      setStage('error');
    } finally {
      setUploading(false);
    }
  };
  
  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Calculate time elapsed
  const getElapsedTime = () => {
    if (!uploadStats.endTime || !uploadStartTimeRef.current) return '--:--';
    const seconds = Math.round((uploadStats.endTime - uploadStartTimeRef.current) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
            ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'} 
            hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {file ? (
              <Upload className="w-10 h-10 text-green-500" />
            ) : (
              <FileUp className="w-10 h-10 text-gray-400" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">
                {file ? file.name : 'Click to upload a slide file'}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {file ? `${formatFileSize(file.size)}` : 'SVS or NDPI files only'}
            </p>
          </div>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".svs,.ndpi"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {file && !uploading && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-gray-600">Use compression</span>
            <button 
              type="button"
              onClick={() => setUseCompression(prev => !prev)}
              className="flex items-center focus:outline-none"
              aria-pressed={useCompression}
            >
              {useCompression ? (
                <ToggleRight className="h-6 w-6 text-indigo-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="ml-2 text-sm font-medium">
                {useCompression ? 'On' : 'Off'}
              </span>
            </button>
          </div>
          
          <button
            onClick={processAndUpload}
            disabled={uploading}
            className={`w-full px-4 py-2 text-white bg-indigo-600 rounded-md 
              ${uploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          >
            {uploading ? 'Processing...' : 'Upload Slide'}
          </button>
          
          {useCompression ? (
            <p className="text-xs text-gray-500 text-center">
              Compression enabled: Slower startup but faster overall for most connections
            </p>
          ) : (
            <p className="text-xs text-gray-500 text-center">
              Compression disabled: Faster startup but uses more bandwidth
            </p>
          )}
        </div>
      )}

      {uploading && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {stage === 'reading' && 'Reading file...'}
              {stage === 'compressing' && 'Compressing...'}
              {stage === 'uploading' && 'Uploading...'}
              {stage === 'complete' && 'Upload complete!'}
              {stage === 'error' && 'Upload failed'}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                stage === 'error' ? 'bg-red-500' : 
                stage === 'complete' ? 'bg-green-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Display upload stats when completed */}
      {stage === 'complete' && uploadStats.endTime && (
        <div className="mt-4 p-3 bg-green-50 rounded-md text-sm">
          <h4 className="font-medium text-green-800 mb-1">Upload Complete</h4>
          <div className="grid grid-cols-2 gap-2 text-green-700">
            <div>Total Time:</div>
            <div>{getElapsedTime()}</div>
            
            {useCompression && (
              <>
                <div>Original Size:</div>
                <div>{formatFileSize(uploadStats.originalSize)}</div>
                
                <div>Compressed Size:</div>
                <div>{formatFileSize(uploadStats.compressedSize)}</div>
                
                <div>Space Saved:</div>
                <div>{uploadStats.compressionRatio}%</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 