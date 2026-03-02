const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1.0';

// API service for file operations
export const fileAPI = {
    // Get all files for the current user
    getFiles: async (token) => {
        const response = await fetch(`${API_BASE_URL}/files/my-files`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    },

    // Upload a file
    uploadFile: async (token, formData) => {
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        
        return response.json();
    },

    // Delete a file
    deleteFile: async (token, fileId) => {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete file');
        }
        
        return response.json();
    },

    // Toggle file visibility (public/private)
    toggleFileVisibility: async (token, fileId) => {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to toggle file visibility');
        }
        
        return response.json();
    },

    // Download a file
    downloadFile: async (token, fileId) => {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to download file');
        }
        
        return response.blob();
    },

    // Get public file (no auth required)
    getPublicFile: async (fileId) => {
        const response = await fetch(`${API_BASE_URL}/files/public/${fileId}`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch public file');
        }
        
        return response.json();
    }
};
