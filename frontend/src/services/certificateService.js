export const certificateService = {
    getByHash: async (hash) => {
        const res = await fetch(`http://localhost:8000/api/certificates/${hash}`);

        if (!res.ok) return null;

        return await res.json();
    }
};