// // app/slides/[filename]/page.jsx
// 'use client';

// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import OpenSeadragon from 'openseadragon';
// import { useAuth } from '@/hooks/useAuth';

// export default function SlidePage() {
//   const params = useParams();
//   const router = useRouter();
//   const { user } = useAuth();
//   const containerRef = useRef(null);
//   const viewerRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const mountedRef = useRef(false);

//   const initializeViewer = useCallback(async () => {
//     console.log('Initializing viewer...'); // Debug log
    
//     if (!containerRef.current || !mountedRef.current) {
//       console.log('Container not ready or component unmounted');
//       return;
//     }
    
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
//       console.log('Fetching DZI data from:', apiUrl);
      
//       const dziResponse = await fetch(`${apiUrl}/api/slides/${filename}/dzi`);
//       if (!dziResponse.ok) {
//         throw new Error(`DZI fetch failed: ${dziResponse.statusText}`);
//       }

//       const response = await dziResponse.json();
//       console.log('DZI data received:', response); // Debug log
      
//       if (!response.dzi) {
//         throw new Error('Invalid DZI data received');
//       }

//       // Clean up existing viewer
//       if (viewerRef.current) {
//         console.log('Destroying existing viewer');
//         viewerRef.current.destroy();
//         viewerRef.current = null;
//       }

//       console.log('Creating new viewer');
//       const viewer = new OpenSeadragon({
//         element: containerRef.current,
//         prefixUrl: '/openseadragon-images/',
//         showNavigator: true,
//         navigatorPosition: 'BOTTOM_RIGHT',
        
//         // Basic settings
//         defaultZoomLevel: 1,
//         minZoomLevel: 0.5,
//         maxZoomLevel: 10,
//         autoResize: true,
//         animationTime: 0.5,
//         blendTime: 0.1,
        
//         // Performance settings
//         immediateRender: true,
//         preserveViewport: true,
//         constrainDuringPan: true,
//         maxImageCacheCount: 100,
//         imageLoaderLimit: 3,
//         timeout: 60000,
        
//         tileSources: {
//           height: response.dzi.Image.Size.Height,
//           width: response.dzi.Image.Size.Width,
//           tileSize: response.dzi.Image.TileSize,
//           overlap: response.dzi.Image.Overlap,
//           getTileUrl: function(level, x, y) {
//             return `${apiUrl}/api/slides/${filename}/tile/${level}/${x}/${y}`;
//           }
//         }
//       });

//       // Add event handlers
//       viewer.addHandler('open', function() {
//         console.log('Viewer opened successfully');
//         setLoading(false);
//       });

//       viewer.addHandler('open-failed', function(event) {
//         console.error('Viewer failed to open:', event);
//         setError('Failed to open slide viewer');
//         setLoading(false);
//       });

//       viewer.addHandler('tile-load-failed', function(event) {
//         console.warn('Tile load failed:', {
//           level: event.tile?.level,
//           x: event.tile?.x,
//           y: event.tile?.y
//         });
//       });

//       // Store viewer reference
//       viewerRef.current = viewer;

//     } catch (err) {
//       console.error('Viewer initialization error:', err);
//       setError(err.message);
//       setLoading(false);
//     }
//   }, [filename]);

//   useEffect(() => {
//     console.log('Component mounted'); // Debug log
//     mountedRef.current = true;
    
//     initializeViewer().catch(err => {
//       console.error('Failed to initialize viewer:', err);
//       setError(err.message);
//       setLoading(false);
//     });

//     return () => {
//       console.log('Component unmounting'); // Debug log
//       mountedRef.current = false;
//       if (viewerRef.current) {
//         viewerRef.current.destroy();
//         viewerRef.current = null;
//       }
//     };
//   }, [initializeViewer]);

//   if (error) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <div className="text-red-500">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-screen relative">
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="text-white">Loading slide viewer...</div>
//         </div>
//       )}
//       <div 
//         ref={containerRef}
//         className="w-full h-full"
//         style={{ backgroundColor: '#000' }}
//       />
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OpenSeadragon from 'openseadragon';
import { useAuth } from '@/hooks/useAuth';
import Cookies from 'js-cookie';

export default function SlidePage() {
  const router = useRouter();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const params = useParams();
  const filename = params.filename;
  

  const initializeViewer = useCallback(async () => {
    console.log('Initializing viewer...'); // Debug log
    
    if (!containerRef.current || !mountedRef.current) {
      console.log('Container not ready or component unmounted');
      return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.241.228.97:8080';
      console.log('Fetching DZI data from:', apiUrl);
      
      // Add authorization header
      const dziResponse = await fetch(`${apiUrl}/api/slides/${filename}/dzi`, {
        // headers: {
        //   'Authorization': `Bearer ${Cookies.get('token')}`
        // }
      });

      if (dziResponse.status === 401) {
        router.push('/login');
        return;
      }

      if (!dziResponse.ok) {
        throw new Error(`DZI fetch failed: ${dziResponse.statusText}`);
      }

      const response = await dziResponse.json();
      console.log('DZI data received:', response);
      
      if (!response.dzi) {
        throw new Error('Invalid DZI data received');
      }

      if (viewerRef.current) {
        console.log('Destroying existing viewer');
        viewerRef.current.destroy();
        viewerRef.current = null;
      }

      console.log('Creating new viewer');
      const viewer = new OpenSeadragon({
        element: containerRef.current,
        prefixUrl: '/openseadragon-images/',
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        
        defaultZoomLevel: 1,
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
            // Add token to tile requests
            return `${apiUrl}/api/slides/${filename}/tile/${level}/${x}/${y}`;
          }
        }
      });

      viewer.addHandler('open', function() {
        console.log('Viewer opened successfully');
        setLoading(false);
      });

      viewer.addHandler('open-failed', function(event) {
        console.error('Viewer failed to open:', event);
        setError('Failed to open slide viewer');
        setLoading(false);
      });

      viewer.addHandler('tile-load-failed', function(event) {
        console.warn('Tile load failed:', {
          level: event.tile?.level,
          x: event.tile?.x,
          y: event.tile?.y
        });
      });

      viewerRef.current = viewer;

    } catch (err) {
      console.error('Viewer initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [filename, router]);

  useEffect(() => {
    console.log('SlidePage mounted')
    // Check for authentication
    // const token = Cookies.get('token');
    // if (!token) {
    //   router.push('/login');
    //   return;
    // }

    console.log('Component mounted');
    mountedRef.current = true;
    
    initializeViewer().catch(err => {
      console.error('Failed to initialize viewer:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      console.log('Component unmounting');
      mountedRef.current = false;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [initializeViewer, router]);

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg shadow">
          <h3 className="font-medium">Error Loading Slide</h3>
          <p className="mt-1 text-sm">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-3 text-sm text-red-600 hover:text-red-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <div className="text-white mt-4">Loading slide viewer...</div>
          </div>
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ backgroundColor: '#000' }}
      />
    </div>
  );
}