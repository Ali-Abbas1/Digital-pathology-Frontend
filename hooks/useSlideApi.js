'use client'
import { useState, useCallback } from 'react'

export const useSlideApi = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const getSlideInfo = useCallback(async(slideId) => {
        setIsLoading(true);
        setError(null)

        try {
            // Updated endpoint to match new API structure
            const response = await fetch(`${baseUrl}/api/slides/${slideId}/info`)
            if (!response.ok) throw new Error('Failed to fetch slide info')
                
            const data = await response.json()
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return null;
        } finally {
            setIsLoading(false)
        }
    }, [baseUrl])

    const getDziUrl = useCallback((slideId) => {
        return `${baseUrl}/api/slides/${slideId}/dzi`;
    }, [baseUrl]);

    const getTileUrl = useCallback((slideId, level, x, y) => {
        // Updated endpoint to match new API structure
        return `${baseUrl}/api/slides/${slideId}/tile/${level}/${x}_${y}.jpeg`;
    }, [baseUrl]);
    
    return {
        getSlideInfo,
        getDziUrl,
        getTileUrl,
        isLoading,
        error
    };
};