'use client';

import { useState, useRef, useEffect } from 'react';
import { gzip } from 'fflate';
import { Upload, FileUp, Pause, Play, ToggleLeft, ToggleRight } from 'lucide-react'; 

// Define a worker for compression
const createCompressionWorker = () => {
  const workerCode = `
    self.importScripts('https://unpkg.com/fflate@0.8.2/umd/index.js');
    
    self.onmessage = function(e) {
      const { chunk, chunkId, compressionLevel } = e.data;
      
      self.fflate.gzip(chunk, { level: compressionLevel || 6 }, (err, compressed) => {
        if (err) {
          self.postMessage({ error: err.message, chunkId });
        } else {
          self.postMessage({ compressed, chunkId });
        }
      });
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export default function ChunkedCompressedUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [useCompression, setUseCompression] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState('waiting'); // waiting, reading, compressing, uploading, complete
  const [chunkProgress, setChunkProgress] = useState([]);
  const fileInputRef = useRef(null);
  const workersRef = useRef([]);
  const chunksRef = useRef([]);
  const uploadIdRef = useRef(null);
  
  // References for tracking active uploads and queue
  const activeUploadsRef = useRef(new Set());
  const pendingChunksRef = useRef([]);
  const completedChunksRef = useRef(new Set());
  const uploadStartTimeRef = useRef(null);

  // Stats for upload progress
  const [uploadStats, setUploadStats] = useState({
    speed: 0,
    eta: 0,
    activeConnections: 0
  });

  // Maximum concurrent uploads
  const MAX_CONCURRENT_UPLOADS = 4;

  // Clean up workers on unmount
  useEffect(() => {
    return () => {
      workersRef.current.forEach(worker => worker.terminate());
      workersRef.current = [];
    };
  }, []);

  // Update upload statistics periodically
  useEffect(() => {
    if (!uploading || !uploadStartTimeRef.current) return;
    
    const updateInterval = setInterval(() => {
      const completedCount = completedChunksRef.current.size;
      if (completedCount === 0 || !chunksRef.current.length) return;
      
      // Calculate elapsed time and progress
      const elapsedSeconds = (Date.now() - uploadStartTimeRef.current) / 1000;
      const totalChunks = chunksRef.current.length;
      const chunksPerSecond = completedCount / elapsedSeconds;
      
      // Estimated time of arrival (ETA)
      const remainingChunks = totalChunks - completedCount;
      const eta = chunksPerSecond > 0 ? remainingChunks / chunksPerSecond : 0;
      
      setUploadStats({
        speed: chunksPerSecond,
        eta,
        activeConnections: activeUploadsRef.current.size
      });
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [uploading]);
  
  // Process the upload queue whenever state changes
  useEffect(() => {
    if (isPaused || !uploading || currentStage !== 'compressing') return;
    
    processUploadQueue();
  }, [isPaused, uploading, currentStage, chunkProgress]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setProgress(0);
      setCurrentStage('waiting');
      setChunkProgress([]);
      activeUploadsRef.current = new Set();
      pendingChunksRef.current = [];
      completedChunksRef.current = new Set();
    }
  };

  const createChunks = (file) => {
    const chunkSize = 50 * 1024 * 1024; // 50MB chunks
    const chunks = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({
        id: `chunk_${chunks.length}`,
        file: file.slice(start, end),
        start,
        end,
        size: end - start,
        status: 'pending',
        progress: 0,
        attempts: 0
      });
      start = end;
    }

    return chunks;
  };
  
  const processUploadQueue = async () => {
    if (isPaused) return;
    
    // Check if we're done with all chunks
    if (completedChunksRef.current.size === chunksRef.current.length && chunksRef.current.length > 0) {
      // All chunks completed
      finalizeUpload();
      return;
    }
    
    // Process more chunks if we're under the concurrent limit
    while (activeUploadsRef.current.size < MAX_CONCURRENT_UPLOADS && pendingChunksRef.current.length > 0) {
      const nextChunk = pendingChunksRef.current.shift();
      
      // Skip if already completed or active
      if (completedChunksRef.current.has(nextChunk.id) || activeUploadsRef.current.has(nextChunk.id)) {
        continue;
      }
      
      // Add to active uploads
      activeUploadsRef.current.add(nextChunk.id);
      
      // Start processing this chunk (don't await here to allow concurrency)
      processChunk(nextChunk, chunksRef.current.findIndex(c => c.id === nextChunk.id), chunksRef.current.length)
        .then(() => {
          // On success
          activeUploadsRef.current.delete(nextChunk.id);
          completedChunksRef.current.add(nextChunk.id);
          
          // Update progress
          updateOverallProgress();
          
          // Process more from queue
          processUploadQueue();
        })
        .catch(err => {
          // On error
          console.error(`Error processing chunk ${nextChunk.id}:`, err);
          activeUploadsRef.current.delete(nextChunk.id);
          
          // Retry up to 3 times with exponential backoff
          if (nextChunk.attempts < 3) {
            nextChunk.attempts++;
            // Put back in queue but with delay based on attempt count
            setTimeout(() => {
              pendingChunksRef.current.push(nextChunk);
              processUploadQueue();
            }, 1000 * Math.pow(2, nextChunk.attempts - 1)); // 1s, 2s, 4s
          } else {
            // If exceeded retry attempts, mark as permanent error
            setChunkProgress(prev => {
              const updatedProgress = [...prev];
              const index = chunksRef.current.findIndex(c => c.id === nextChunk.id);
              if (index >= 0) {
                updatedProgress[index] = { ...updatedProgress[index], status: 'error', error: err.message };
              }
              return updatedProgress;
            });
          }
        });
    }
  };
  
  const updateOverallProgress = () => {
    // Calculate progress percentage based on completed chunks
    const total = chunksRef.current.length;
    const completed = completedChunksRef.current.size;
    
    if (total > 0) {
      const progressPercent = Math.floor((completed / total) * 100);
      setProgress(progressPercent);
    }
  };

  const processChunk = async (chunk, index, totalChunks) => {
    try {
      // Update chunk status to processing
      setChunkProgress(prev => {
        const updated = [...prev];
        const status = useCompression ? 'compressing' : 'uploading';
        updated[index] = { ...updated[index], status, progress: useCompression ? 10 : 20 };
        return updated;
      });
      
      let dataToUpload;
      let fileName = chunk.id;
      
      if (useCompression) {
        // Create a worker for this chunk
        const worker = createCompressionWorker();
        workersRef.current.push(worker);

        // Read chunk
        const arrayBuffer = await chunk.file.arrayBuffer();
        const chunkData = new Uint8Array(arrayBuffer);

        // Compress chunk in worker
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
          worker.postMessage({ 
            chunk: chunkData, 
            chunkId: chunk.id,
            compressionLevel: 6
          });
        });

        // Update chunk's progress to 50% after compression
        setChunkProgress(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress: 50, status: 'uploading' };
          return updated;
        });

        // Create a blob from compressed data
        dataToUpload = new Blob([compressedData], { type: 'application/gzip' });
        fileName = `${chunk.id}.gz`;
        
        // Clean up the worker
        const workerIndex = workersRef.current.indexOf(worker);
        if (workerIndex !== -1) {
          worker.terminate();
          workersRef.current.splice(workerIndex, 1);
        }
      } else {
        // Use uncompressed data directly
        dataToUpload = chunk.file;
        setChunkProgress(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress: 50, status: 'uploading' };
          return updated;
        });
      }

      // Create FormData with chunk data
      const formData = new FormData();
      formData.append('file', dataToUpload, fileName);
      formData.append('chunkIndex', index.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('uploadId', uploadIdRef.current);
      formData.append('originalName', file.name);
      formData.append('compressed', useCompression ? 'true' : 'false');

      // Get API URL from environment variable or default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';

      // Upload the chunk
      const response = await fetch(`${apiUrl}/api/upload-chunk`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Chunk upload failed');
      }

      // Update chunk's progress to 100% after upload
      setChunkProgress(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], progress: 100, status: 'completed' };
        return updated;
      });

      return await response.json();

    } catch (err) {
      console.error(`Error processing chunk ${index}:`, err);
      throw err;
    }
  };

  const initializeUpload = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
    
    const response = await fetch(`${apiUrl}/api/initialize-chunked-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadId: Date.now().toString(), // Generate a unique ID
        fileName: file.name,
        totalChunks: chunksRef.current.length
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize upload');
    }

    const data = await response.json();
    return data.upload_id || Date.now().toString();
  };

  const finalizeUpload = async () => {
    try {
      setCurrentStage('finalizing');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
      
      const response = await fetch(`${apiUrl}/api/complete-chunked-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: uploadIdRef.current,
          fileName: file.name,
          totalChunks: chunksRef.current.length
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete upload');
      }
  
      const finalResult = await response.json();
      
      // Clean up
      workersRef.current.forEach(worker => worker.terminate());
      workersRef.current = [];
  
      setCurrentStage('complete');
      setProgress(100);
  
      // Reset form state
      setTimeout(() => {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
  
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(finalResult);
      }
    } catch (err) {
      console.error('Upload completion error:', err);
      setError(err.message || 'Failed to complete upload');
      setCurrentStage('error');
      setUploading(false);
    }
  };

  const processAndUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setIsPaused(false);
      setProgress(0);
      setCurrentStage('reading');
      uploadStartTimeRef.current = Date.now();

      // Create chunks from file
      const chunks = createChunks(file);
      chunksRef.current = chunks;
      
      // Initialize chunk progress state
      setChunkProgress(chunks.map((_, index) => ({ 
        id: chunks[index].id,
        progress: 0, 
        status: 'pending',
        index
      })));

      // Initialize upload on server
      setCurrentStage('initializing');
      uploadIdRef.current = await initializeUpload();

      // Reset tracking objects
      activeUploadsRef.current = new Set();
      completedChunksRef.current = new Set();
      pendingChunksRef.current = [...chunks]; // Copy chunks to pending queue
      
      // Start processing chunks concurrently
      setCurrentStage('compressing');
      
      // The processUploadQueue function will be triggered by the useEffect
    } catch (err) {
      console.error('Upload initialization error:', err);
      setError(err.message || 'Failed to initialize upload');
      setCurrentStage('error');
      setUploading(false);
    }
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="chunked-file-upload"
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
                {file ? file.name : 'Click to upload a large slide file'}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'SVS or NDPI files (up to 20GB)'}
            </p>
          </div>
          <input
            id="chunked-file-upload"
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
            Upload Large Slide (Chunked)
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            File will be split into 50MB chunks, {useCompression ? 'compressed, and ' : ''}
            uploaded with 4 concurrent connections
          </p>
          
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
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-3">
                {currentStage === 'reading' && 'Preparing chunks...'}
                {currentStage === 'initializing' && 'Initializing upload...'}
                {currentStage === 'compressing' && !isPaused ? 'Uploading...' : 'Paused'}
                {currentStage === 'finalizing' && 'Finalizing upload...'}
                {currentStage === 'complete' && 'Upload complete!'}
              </span>
              
              {currentStage === 'compressing' && (
                <button 
                  onClick={togglePause} 
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label={isPaused ? "Resume upload" : "Pause upload"}
                >
                  {isPaused ? (
                    <Play size={16} className="text-green-600" />
                  ) : (
                    <Pause size={16} className="text-blue-600" />
                  )}
                </button>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Upload stats */}
          {currentStage === 'compressing' && (
            <div className="flex justify-between text-xs text-gray-500 py-1">
              <div>
                ETA: {formatTime(uploadStats.eta)}
              </div>
              <div>
                Active connections: {uploadStats.activeConnections}/{MAX_CONCURRENT_UPLOADS}
              </div>
            </div>
          )}
          
          {chunkProgress.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Chunk Status:</h4>
                <span className="text-xs text-gray-500">
                  {completedChunksRef.current.size} / {chunkProgress.length} complete
                </span>
              </div>
              
              {/* Compact chunk grid */}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 mb-3">
                {chunkProgress.map((chunk, index) => (
                  <div
                    key={index}
                    className={`h-3 rounded-sm ${
                      chunk.status === 'completed' ? 'bg-green-500' :
                      chunk.status === 'error' ? 'bg-red-500' :
                      chunk.status === 'uploading' ? 'bg-blue-500' :
                      chunk.status === 'compressing' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                    title={`Chunk ${index + 1}: ${chunk.status}`}
                  />
                ))}
              </div>
              
              {/* Active chunks */}
              <div className="space-y-2">
                {chunkProgress
                  .filter(chunk => chunk.status === 'uploading' || chunk.status === 'compressing')
                  .slice(0, 4) // Show only first few active chunks
                  .map((chunk, i) => (
                    <div key={i} className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        chunk.status === 'uploading' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="w-16">Chunk {chunk.index + 1}</div>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full mx-2">
                        <div 
                          className={`h-1.5 rounded-full ${
                            chunk.status === 'uploading' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${chunk.progress}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-right">{chunk.progress}%</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 