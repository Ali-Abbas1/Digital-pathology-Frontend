/* eslint-disable no-restricted-globals */

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadChunkWithRetry(formData, apiUrl, retries = 0) {
    try {
        const response = await fetch(`${apiUrl}/upload-chunk`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            // headers: {
            //     'Access-Control-Allow-Origin': 'http://localhost:3000'
            // }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (retries < MAX_RETRIES) {
            await sleep(RETRY_DELAY);
            return uploadChunkWithRetry(formData, apiUrl, retries + 1);
        }
        throw error;
    }
}

self.onmessage = async function(e) {
    const { 
        chunk, 
        chunkId, 
        chunkIndex, 
        totalChunks, 
        uploadId, 
        file,
        apiUrl 
    } = e.data;
    
    try {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkId', chunkId);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('uploadId', uploadId);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size);

        const reader = new FileReader();
        let lastLoaded = 0;
        const startTime = Date.now();

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const loaded = event.loaded - lastLoaded;
                lastLoaded = event.loaded;
                
                self.postMessage({
                    type: 'progress',
                    chunkId,
                    chunkIndex,
                    chunkProgress: (event.loaded / event.total) * 100,
                    bytesUploaded: loaded,
                    timestamp: Date.now() - startTime
                });
            }
        };

        const result = await uploadChunkWithRetry(formData, apiUrl);

        self.postMessage({
            type: 'complete',
            chunkId,
            chunkIndex,
            response: result
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            chunkId,
            chunkIndex,
            error: error.message || 'Chunk upload failed'
        });
    }
};