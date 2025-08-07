'use client'
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSlideApi } from './useSlideApi';
import OpenSeadragon from 'openseadragon';

export const useSlideViewer = ({ slideId, viewerId }) => {
    const viewer = useRef(null);
    const { getSlideInfo, getDziUrl } = useSlideApi();
    const [status, setStatus] = useState('idle');
    const [viewerState, setViewerState] = useState({
        zoom: 1,
        pan: { x: 0, y: 0 }
    });

    const zoomIn = useCallback(() => {
        viewer.current?.viewport.zoomBy(2.0);
    }, []);

    const zoomOut = useCallback(() => {
        viewer.current?.viewport.zoomBy(0.5);
    }, []);

    const resetView = useCallback(() => {
        viewer.current?.viewport.goHome();
    }, []);

    const initViewer = useCallback(async () => {
        try {
            setStatus('loading');
            
            // Get slide info first
            const slideInfo = await getSlideInfo(slideId);
            if (!slideInfo) {
                throw new Error('Failed to load slide information');
            }

            // Only create new viewer if one doesn't exist
            if (!viewer.current) {
                viewer.current = new OpenSeadragon({
                    id: viewerId,
                    prefixUrl: '/openseadragon-images/',
                    tileSources: getDziUrl(slideId),
                    
                    // Viewer settings
                    showNavigator: true,
                    navigatorPosition: 'BOTTOM_RIGHT',
                    showRotationControl: true,
                    
                    // Zoom settings
                    minZoomLevel: 0.1,
                    maxZoomLevel: 10,
                    defaultZoomLevel: 1,
                    
                    // Performance optimizations
                    imageLoaderLimit: 8,
                    maxImageCacheCount: 200,
                    timeout: 60000,
                    
                    // Animation settings
                    animationTime: 0.5,
                    springStiffness: 7,
                    immediateRender: true,
                    blendTime: 0,
                    alwaysBlend: false,
                    
                    // Viewport settings
                    visibilityRatio: 0.5,
                    constrainDuringPan: true,
                    
                    // Mouse settings
                    gestureSettingsMouse: {
                        scrollToZoom: true,
                        clickToZoom: true,
                        dblClickToZoom: true,
                        pinchToZoom: true,
                    }
                });

                // Event handlers
                viewer.current.addHandler('open', () => {
                    viewer.current.viewport.goHome(true);
                    setStatus('success');
                });

                viewer.current.addHandler('viewport-change', () => {
                    const viewport = viewer.current?.viewport;
                    if (viewport) {
                        setViewerState({
                            zoom: viewport.getZoom(),
                            pan: {
                                x: viewport.getCenter().x,
                                y: viewport.getCenter().y
                            }
                        });
                    }
                });

                viewer.current.addHandler('tile-load-failed', (event) => {
                    console.error('Tile load failed:', event);
                });
            }

        } catch (err) {
            console.error('Viewer initialization failed:', err);
            setStatus('error');
        }
    }, [slideId, viewerId, getSlideInfo, getDziUrl]);

    useEffect(() => {
        initViewer();
        
        return () => {
            if (viewer.current) {
                viewer.current.destroy();
                viewer.current = null;
            }
        };
    }, [initViewer]);

    return {
        viewer: viewer.current,
        status,
        viewerState,
        controls: {
            zoomIn,
            zoomOut,
            resetView
        }
    };
};