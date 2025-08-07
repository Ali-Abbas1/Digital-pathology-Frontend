import { v4 as uuidv4 } from 'uuid';

export const CHUNK_SIZE = 500 * 1024 * 1024; // 500MB chunks

export const createChunks = (file) => {
    const chunks = [];
    let start = 0;
    
    while (start < file.size) {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        chunks.push({
            id: uuidv4(),
            index: Math.floor(start / CHUNK_SIZE),
            start,
            end,
            size: end - start,
            status: 'pending',
            attempts: 0,
            lastAttempt: null
        });
        start = end;
    }
    
    return chunks;
};

export const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateSpeed = (loaded, total, startTime) => {
    const timeElapsed = (Date.now() - startTime) / 1000;
    const speed = loaded / timeElapsed;
    return speed;
};

export const calculateTimeRemaining = (loaded, total, speed) => {
    if (speed === 0) return Infinity;
    const remaining = total - loaded;
    return remaining / speed;
};