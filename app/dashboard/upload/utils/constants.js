export const UPLOAD_CONFIG = {
    CHUNK_SIZE: 1024 * 1024 * 1024, // 1GB chunks
    MAX_CHUNK_SIZE: 2 * 1024 * 1024 * 1024, // 2GB max
    MIN_CHUNK_SIZE: 512 * 1024 * 1024, // 512MB min
    MAX_CONCURRENT_UPLOADS: 2,
    MAX_RETRIES: 3,
    RETRY_DELAY: 3000, // 3 seconds
    MAX_FILE_SIZE: 20 * 1024 * 1024 * 1024, // 20GB
    ALLOWED_TYPES: ['.svs', '.ndpi'],
    MEMORY_THRESHOLD: 0.8, // 80% memory usage threshold
};

export const UPLOAD_STATUS = {
    IDLE: 'idle',
    PREPARING: 'preparing',
    UPLOADING: 'uploading',
    PAUSED: 'paused',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error',
} 
