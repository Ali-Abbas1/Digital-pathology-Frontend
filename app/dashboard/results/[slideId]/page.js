'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OpenSeadragon from 'openseadragon';
import Link from 'next/link';
import { ChevronLeft, ZoomIn, ZoomOut, Move, Maximize, Info, X } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const slideId = params.slideId;
  
  // Refs for the viewers
  const originalContainerRef = useRef(null);
  const originalViewerRef = useRef(null);
  const heatmapContainerRef = useRef(null);
  const heatmapViewerRef = useRef(null);
  
  // State for controlling UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideData, setSlideData] = useState(null);
  const [syncViewers, setSyncViewers] = useState(true);
  const [infoVisible, setInfoVisible] = useState(false);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0, zoom: 1 });
  const [heatmapError, setHeatmapError] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  
  const mountedRef = useRef(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';

  // Fetch slide data and initialize viewers
  useEffect(() => {
    // Set the slide data
    setSlideData({
      original_filename: slideId,
      task_id: slideId
    });
  }, [slideId]);

  // Initialize both viewers
  const initializeViewers = useCallback(async () => {
    if (!originalContainerRef.current || !heatmapContainerRef.current || !mountedRef.current) return;
    
    try {
      setLoading(true);
      
      const originalFilename = slideData?.original_filename || slideId;
      
      const dziResponse = await fetch(`${apiUrl}/api/slides/${originalFilename}/dzi`);
      
      if (!dziResponse.ok) {
        throw new Error(`DZI fetch failed: ${dziResponse.statusText}`);
      }
  
      const response = await dziResponse.json();
      console.log('Original slide DZI data received:', response);
      
      if (!response.dzi) {
        throw new Error('Invalid DZI data received');
      }
  
      if (originalViewerRef.current) {
        originalViewerRef.current.destroy();
        originalViewerRef.current = null;
      }
  
      const originalViewer = new OpenSeadragon({
        element: originalContainerRef.current,
        prefixUrl: '/openseadragon-images/',
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        defaultZoomLevel: 5,
        minZoomLevel: 0.5,
        maxZoomLevel: 20,
        autoResize: true,
        animationTime: 0.5,
        blendTime: 0.1,
        immediateRender: true,
        preserveViewport: true,
        constrainDuringPan: true,
        maxImageCacheCount: 100,
        imageLoaderLimit: 3,
        timeout: 60000,
        tileSources: {
          height: response.dzi.Image.Size.Height,
          width: response.dzi.Image.Size.Width,
          tileSize: response.dzi.Image.TileSize,
          overlap: response.dzi.Image.Overlap,
          getTileUrl: function(level, x, y) {
            return `${apiUrl}/api/slides/${originalFilename}/tile/${level}/${x}/${y}`;
          }
        }
      });
  
      originalViewerRef.current = originalViewer;
      
      let heatmapExists = false;
      let heatmapDziData = null;
      try {
        const heatmapDziResponse = await fetch(`${apiUrl}/api/heatmap_dzi/${slideId}`);
        if (heatmapDziResponse.ok) {
          heatmapDziData = await heatmapDziResponse.json();
          if (heatmapDziData.dzi) {
            heatmapExists = true;
            console.log('Heatmap DZI data received:', heatmapDziData);
            setLoading(false)
          }
        } else {
          console.error('Heatmap DZI not found:', heatmapDziResponse.status, heatmapDziResponse.statusText);
        }
      } catch (checkErr) {
        console.error('Error checking heatmap DZI existence:', checkErr);
      }
  
      if (heatmapViewerRef.current) {
        heatmapViewerRef.current.destroy();
        heatmapViewerRef.current = null;
      }
      
      if (heatmapExists) {
        console.log('Initializing heatmap viewer with DZI:', heatmapDziData);
        
        const heatmapViewer = new OpenSeadragon({
          element: heatmapContainerRef.current,
          prefixUrl: '/openseadragon-images/',
          showNavigator: true,
          navigatorPosition: 'BOTTOM_RIGHT',
          defaultZoomLevel: 5,
          minZoomLevel: 0.5,
          maxZoomLevel: 20,
          autoResize: true,
          animationTime: 0.5,
          blendTime: 0.1,
          immediateRender: true,
          preserveViewport: true,
          constrainDuringPan: true,
          maxImageCacheCount: 100,
          imageLoaderLimit: 3,
          timeout: 60000,
          tileSources: {
            height: heatmapDziData.dzi.Image.Size.Height,
            width: heatmapDziData.dzi.Image.Size.Width,
            tileSize: heatmapDziData.dzi.Image.TileSize,
            overlap: heatmapDziData.dzi.Image.Overlap,
            getTileUrl: function(level, x, y) {
              return `${apiUrl}/api/heatmap_tile/${slideId}/${level}/${x}_${y}`;
            }
          }
        });
        
        heatmapViewerRef.current = heatmapViewer;
        
        let openCount = 0
        const totalViewers = heatmapExists ? 2 : 1;
        
        heatmapViewer.addOnceHandler('open-failed', function(event) {
          console.error('Heatmap viewer failed to open:', event);
          setHeatmapError(true);
        });

        let syncing = false;
        heatmapViewer.addOnceHandler('open', function(event) {
          console.log('Heatmap viewer opened successfully:', event);
          openCount++;
          if (openCount === totalViewers) setLoading(false)
          if (syncViewers && originalViewer && heatmapViewer) {
            originalViewer.addHandler('zoom', function(event) {
              if (!syncing && heatmapViewer.viewport) {
                syncing = true
                heatmapViewer.viewport.zoomTo(event.zoom);
                syncing = false
              }
            });
            originalViewer.addHandler('pan', function(event) {
              if (!syncing && heatmapViewer.viewport) {
                syncing = true
                heatmapViewer.viewport.panTo(originalViewer.viewport.getCenter());
                syncing = false
              }
            });
            heatmapViewer.addHandler('zoom', function(event) {
              if (originalViewer.viewport) {
                originalViewer.viewport.zoomTo(event.zoom);
              }
            });
            heatmapViewer.addHandler('pan', function(event) {
              if (originalViewer.viewport) {
                originalViewer.viewport.panTo(heatmapViewer.viewport.getCenter());
              }
            });
          }
        });
      } else {
        console.warn('Skipping heatmap viewer initialization as heatmap DZI does not exist');
        setHeatmapError(true);
        setLoading(false)
      }
      
      originalViewer.addHandler('open', function() {
        console.log('Original viewer opened successfully');
        openCount++
        if (openCount === totalViewers) setLoading(false);
        
      });
      
      originalViewer.addHandler('open-failed', function(event) {
        console.error('Original viewer failed to open:', event);
        setError('Failed to load original slide viewer');
      });
  
    } catch (err) {
      console.error('Viewer initialization error:', err);
      setError('Failed to load slide viewers: ' + err.message);
      setLoading(false);
    }

    // Timeout to prevent loader hanging
    setTimeout(() => {
      if (loading) {
        console.warn('Initialization taking too long, forcing loader off');
        setLoading(false);
      }
    }, 30000); // 30-second timeout
  }, [slideData, apiUrl, slideId, syncViewers]);

  // Initialize viewers when slide data is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.log('Component mounted');
    mountedRef.current = true;
    
    if (slideData) {
      initializeViewers();
    }
    
    return () => {
      console.log('Component unmounting');
      mountedRef.current = false;
      
      if (originalViewerRef.current) {
        originalViewerRef.current.destroy();
        originalViewerRef.current = null;
      }
      
      if (heatmapViewerRef.current) {
        heatmapViewerRef.current.destroy();
        heatmapViewerRef.current = null;
      }
    };
  }, [slideData, initializeViewers]);

  // Handle zoom in/out buttons
  const handleZoomIn = () => {
    if (originalViewerRef.current) {
      originalViewerRef.current.viewport.zoomBy(1.5);
    }
  };

  const handleZoomOut = () => {
    if (originalViewerRef.current) {
      originalViewerRef.current.viewport.zoomBy(0.75);
    }
  };

  const handleReset = () => {
    if (originalViewerRef.current) {
      originalViewerRef.current.viewport.goHome();
    }
    if (heatmapViewerRef.current) {
      heatmapViewerRef.current.viewport.goHome();
    }
  };

  // Toggle synchronization
  const toggleSync = () => {
    setSyncViewers(!syncViewers);
    // Re-initialize the viewers to apply sync changes
    initializeViewers();
  };

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg shadow">
          <h3 className="font-medium">Error Loading Results</h3>
          <p className="mt-1 text-sm">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/results')}
            className="mt-3 text-sm text-red-600 hover:text-red-800"
          >
            Return to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gray-900 flex flex-col">
      {/* Header with controls */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/results" className="flex items-center text-sm text-gray-300 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Results
          </Link>
          <h1 className="text-xl font-semibold truncate">
            {slideData?.original_filename || slideId}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleZoomIn} 
            className="p-2 rounded hover:bg-gray-700"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="p-2 rounded hover:bg-gray-700"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button 
            onClick={handleReset} 
            className="p-2 rounded hover:bg-gray-700"
            title="Reset View"
          >
            <Maximize className="h-5 w-5" />
          </button>
          <button 
            onClick={toggleSync} 
            className={`p-2 rounded ${syncViewers ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            title={syncViewers ? "Disable Sync" : "Enable Sync"}
          >
            <Move className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setInfoVisible(!infoVisible)} 
            className={`p-2 rounded ${infoVisible ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            title="Slide Information"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              <div className="text-white mt-4">Loading slide viewers...</div>
            </div>
          </div>
        )}
        
        {/* Split screen for two viewers */}
        <div className="w-1/2 h-full border-r border-gray-700">
          <div 
            ref={originalContainerRef}
            className="w-full h-full" 
          />
          <div className="absolute top-20 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
            Original Slide
          </div>
        </div>
        
        {/* Heatmap viewer */}
        <div className="w-1/2 h-full relative" ref={heatmapContainerRef}>
          {heatmapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-red-900 bg-opacity-90 p-4 rounded-lg max-w-md text-center">
                <h3 className="text-white font-bold mb-2">Heatmap Not Available</h3>
                <p className="text-white text-sm mb-4">
                  The heatmap could not be loaded. This may be because:
                </p>
                <ul className="text-white text-xs text-left list-disc pl-5 mb-4">
                  <li>The analysis is still in progress</li>
                  <li>This slide has no corresponding heatmap</li>
                  <li>The heatmap file was not generated correctly</li>
                </ul>
              </div>
            </div>
          )}
          <div className="absolute top-20 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
            AI Heatmap
          </div>
        </div>
        
        {/* Slide information panel */}
        {infoVisible && slideData && (
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 shadow-lg p-4 overflow-y-auto z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Slide Information</h3>
              <button onClick={() => setInfoVisible(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="text-sm font-medium text-gray-400">Filename</h4>
                <p className="text-white break-all">{slideData.original_filename}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400">Processing ID</h4>
                <p className="text-white break-all">{slideData.task_id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 