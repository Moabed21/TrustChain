const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const certificateService = {
    getByHash: async (hash) => {
        const res = await fetch(`${BASE_URL}/api/certificates/${hash}`);

        if (!res.ok) return null;

        return await res.json();
    }
};