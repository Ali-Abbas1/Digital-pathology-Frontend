const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSlides() {
    const response = await fetch(`${API_URL}/slides`);
    if (!response.ok) throw new Error('Failed to fetch slides');
    return response.json();
}

export async function getSlideInfo(slideId) {
    const response = await fetch(`${API_URL}/slides/${slideId}/info`);
    if (!response.ok) throw new Error('Failed to Fetch Slide info');
    return response.json();
}

export function getTileUrl(slideId, level, x, y) {
    return `${API_URL}/slides/${slideId}/tile/${level}/${x}/${y}`;
}