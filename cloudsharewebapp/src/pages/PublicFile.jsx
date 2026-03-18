import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';

const PublicFile = () => {
    const { fileId } = useParams();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPublicFile();
    }, [fileId]);

    const fetchPublicFile = async () => {
        try {
            setLoading(true);
            const response = await fileAPI.getPublicFile(fileId);
            setFile(response);
        } catch (err) {
            setError('File not found or not public');
            toast.error('Failed to load file');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1.0';
            const downloadUrl = `${API_BASE}/files/${fileId}/download`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started!');
        } catch (err) {
            toast.error('Failed to download file');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error || !file) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">File Not Found</h1>
                    <p className="text-gray-500">{error || 'This file does not exist or is not public'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 mx-auto mb-4">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{file.name}</h1>
                    <p className="text-gray-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleDownload}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicFile;
