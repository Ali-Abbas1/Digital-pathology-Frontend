'use client';

import { ZoomIn, ZoomOut, Home } from 'lucide-react';

const ViewerControls = ({ controls, viewerState, className }) => {
  const { zoomIn, zoomOut, resetView } = controls;

  return (
    <div className={`flex gap-2 bg-white/80 p-2 rounded-lg shadow-lg ${className}`}>
      {/* Zoom information */}
      <div className="px-3 py-1 bg-gray-100 rounded">
        {`${Math.round(viewerState.zoom * 100)}%`}
      </div>

      {/* Control buttons */}
      <button
        onClick={zoomIn}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      <button
        onClick={zoomOut}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      <button
        onClick={resetView}
        className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        title="Reset View"
      >
        <Home size={20} />
      </button>
    </div>
  );
};

export default ViewerControls;