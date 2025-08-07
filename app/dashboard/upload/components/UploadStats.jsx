import { formatSize, formatTime } from '../utils/formatters';

export const UploadStats = ({ 
    uploadedSize, 
    totalSize, 
    speed, 
    timeRemaining,
    currentChunk,
    totalChunks 
}) => {
    return (
        <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{formatSize(uploadedSize)} / {formatSize(totalSize)}</span>
            </div>
            <div className="flex justify-between">
                <span>Speed:</span>
                <span>{formatSize(speed)}/s</span>
            </div>
            <div className="flex justify-between">
                <span>Time Remaining:</span>
                <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex justify-between">
                <span>Chunks:</span>
                <span>{currentChunk} / {totalChunks}</span>
            </div>
        </div>
    );
};
