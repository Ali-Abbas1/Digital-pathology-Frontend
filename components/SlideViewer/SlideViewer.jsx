'use client';

import { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';

const SlideViewer = ({ slideId, apiUrl }) => {
    const viewerRef = useRef(null);
    const viewer = useRef(null);

    useEffect(() => {
        if (!viewerRef.current) return;

        // Initialize OpenSeadragon viewer
        viewer.current = OpenSeadragon({
            element: viewerRef.current,
            prefixUrl: '/openseadragon-images/', // Updated path
            tileSources: {
                type: 'image',
                url: `${apiUrl}/api/slides/${slideId}/dzi`,
                buildPyramid: false,
                tileFormat: 'jpg',
                crossOriginPolicy: 'Anonymous'
            },
            showNavigationControl: true,
            showNavigator: true,
            navigatorPosition: 'BOTTOM_RIGHT',
            zoomPerScroll: 1.2,
            animationTime: 0.5,
            maxZoomPixelRatio: 2,
            wrapHorizontal: false,
            wrapVertical: false,
            minZoomImageRatio: 0.5,
            maxZoomPixelRatio: 2.5,
            defaultZoomLevel: 1,
            loadTilesWithAjax: true,
            ajaxHeaders: {
                'Accept': 'image/jpeg'
            },
            gestureSettingsMouse: {
                clickToZoom: true,
                dblClickToZoom: true,
                pinchToZoom: true,
                scrollToZoom: true,
            }
        });

        // Add error handler for debugging
        viewer.current.addHandler('tile-load-failed', function(event) {
            console.error('Tile failed to load:', event);
        });

        // Cleanup on unmount
        return () => {
            if (viewer.current) {
                viewer.current.destroy();
                viewer.current = null;
            }
        };
    }, [slideId, apiUrl]);

    return (
        <div 
            ref={viewerRef} 
            style={{ 
                width: '100%', 
                height: '600px', 
                backgroundColor: '#000',
                position: 'relative' 
            }} 
        />
    );
};

export default SlideViewer;