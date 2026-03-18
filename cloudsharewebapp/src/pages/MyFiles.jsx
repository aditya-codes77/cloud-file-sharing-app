import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { fileAPI } from '../services/api';
import FileCard from '../components/FileCard';
import { addTransaction } from '../utils/transactions';
import { deductCredits, hasEnoughCredits } from '../utils/credits';

const MyFiles = () => {
    const [viewMode, setViewMode] = useState('list');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    // Fetch files on component mount
    useEffect(() => {
         fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            console.log('Token:', token);
            
            const response = await fileAPI.getFiles(token);
            console.log('API Response:', response);
            
            const fileData = response.data || response.files || response || [];
            setFiles(Array.isArray(fileData) ? fileData : []);
            
            if (fileData.length > 0) {
                toast.success(`${fileData.length} files loaded successfully`);
            }
            
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error(`Failed to load files: ${error.message}`);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle file download
    const handleDownload = async (file) => {
        const userId = user?.id || 'default';
        if (!hasEnoughCredits(1, userId)) {
            toast.error('Not enough credits! Need 1 credit to download');
            return;
        }

        try {
            const token = await getToken();
            
            // Create download URL
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1.0';
            const downloadUrl = `${API_BASE}/files/${file.id}/download`;
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = file.name || file.fileName;
            
            // Add authorization header by fetching with credentials
            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(blobUrl);
            
            // Deduct credits and add transaction
            deductCredits(1, userId);
            addTransaction('download', `Downloaded ${file.name}`, -1, null, userId);
            
            toast.success('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
        }
    };

    // Handle file deletion
    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const userId = user?.id || 'default';
            const token = await getToken();
            const fileToDelete = files.find(f => f.id === fileId);
            
            await fileAPI.deleteFile(token, fileId);
            
            // Remove file from state
            setFiles(prev => prev.filter(f => f.id !== fileId));
            
            // Add transaction
            if (fileToDelete) {
                addTransaction('delete', `Deleted ${fileToDelete.name}`, 0, null, userId);
            }
            
            toast.success('File deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete file');
        }
    };

    // Handle share link copy
    const handleShare = async (file) => {
        const shareUrl = `${window.location.origin}/public/${file.id}`;
        
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Share link copied!');
        }
    };

    // Handle toggle visibility
    const handleToggleVisibility = async (fileId) => {
        try {
            const token = await getToken();
            const response = await fileAPI.toggleFileVisibility(token, fileId);
            
            // Update file in state
            setFiles(prev => prev.map(f => 
                f.id === fileId 
                    ? { ...f, public: response.file.isPublic, isPublic: response.file.isPublic }
                    : f
            ));
            
            const newStatus = response.file.isPublic ? 'public' : 'private';
            toast.success(`File is now ${newStatus}!`);
        } catch (error) {
            console.error('Toggle visibility error:', error);
            toast.error('Failed to update file visibility');
        }
    };

    const fileCount = files.length;

    return(
        <div className="p-4 min-h-screen overflow-hidden" style={{backgroundColor: '#f5efff'}}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-normal">
                    My files <span className="font-bold">{fileCount}</span>
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'text-blue-500' : 'text-gray-500'}`}
                        title="List View"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'text-blue-500' : 'text-gray-500'}`}
                        title="Grid View"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Files Content */}
            <div className="mt-6">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-gray-500">Loading files...</div>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center bg-white rounded-lg shadow-sm p-12 w-fit mx-auto">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 mb-4">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No files uploaded yet</h2>
                        <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                            Start uploading files to see them listed here. You can upload documents, images and other files to share and manage them securely.
                        </p>
                        <button onClick={() => navigate('/upload')} className="bg-purple-400 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out">
                            Go to Upload
                        </button>
                    </div>
                        ) : (
                            <>
                                {viewMode === 'list' ? (
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-5 gap-4 p-3 border-b border-gray-200 bg-white font-semibold text-gray-700 text-sm">
                                    <div>NAME</div>
                                    <div>SIZE</div>
                                    <div>UPLOADED</div>
                                    <div>SHARING</div>
                                    <div>ACTIONS</div>
                                </div>

                                {/* Table Rows */}
                                {files.map((file) => (
                                    <div key={file.id} className="grid grid-cols-5 gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 items-center">
                                        {/* NAME */}
                                        <div className="flex items-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500 flex-shrink-0">
                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="text-gray-800 font-medium truncate text-sm">{file.name || file.fileName}</span>
                                        </div>

                                        {/* SIZE */}
                                        <div className="text-gray-600 text-sm">
                                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                                        </div>

                                        {/* UPLOADED */}
                                        <div className="text-gray-600 text-sm">
                                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown date'}
                                        </div>

                                        {/* SHARING */}
                                        <div className="flex items-center gap-2">
                                            {file.public || file.isPublic ? (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500">
                                                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Public
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Private
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDownload(file)}
                                                className="p-1.5 hover:bg-blue-100 rounded-lg transition" 
                                                title="Download"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleShare(file)}
                                                className="p-1.5 hover:bg-orange-100 rounded-lg transition" 
                                                title="Share Link"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-500">
                                                    <circle cx="18" cy="5" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <circle cx="6" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <circle cx="18" cy="19" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleToggleVisibility(file.id)}
                                                className="p-1.5 hover:bg-purple-100 rounded-lg transition" 
                                                title="Toggle Public/Private"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(file.id)}
                                                className="p-1.5 hover:bg-red-100 rounded-lg transition group" 
                                                title="Delete"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-red-500 transition">
                                                    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {files.map((file) => (
                                    <FileCard 
                                        key={file.id} 
                                        file={file}
                                        onDownload={handleDownload}
                                        onToggle={handleToggleVisibility}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default MyFiles;
