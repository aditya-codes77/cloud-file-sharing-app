import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { fileAPI } from '../services/api';
import { addTransaction } from '../utils/transactions';
import { deductCredits, hasEnoughCredits } from '../utils/credits';

const Upload = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    // Add files to selectedFiles array
    const addFiles = (files) => {
        const newFiles = files.map((file, index) => ({
            id: Date.now() + index,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            isPublic: false,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));
        
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    // Remove file from selection
    const removeFile = (id) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    // Toggle public/private for a file
    const toggleFileVisibility = (id) => {
        setSelectedFiles(prev => prev.map(f => 
            f.id === id ? { ...f, isPublic: !f.isPublic } : f
        ));
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Upload all files
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        const userId = user?.id || 'default';
        const creditsNeeded = selectedFiles.length * 2;
        if (!hasEnoughCredits(creditsNeeded, userId)) {
            toast.error(`Not enough credits! Need ${creditsNeeded} credits to upload ${selectedFiles.length} file(s)`);
            return;
        }

        setUploading(true);
        const token = await getToken();
        
        try {
            const formData = new FormData();
            selectedFiles.forEach((fileObj) => {
                formData.append('files', fileObj.file);
            });

            const response = await fileAPI.uploadFile(token, formData);
            
            // Toggle visibility for files marked as public
            if (response.files) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    if (selectedFiles[i].isPublic && response.files[i] && response.files[i].id) {
                        await fileAPI.toggleFileVisibility(token, response.files[i].id);
                    }
                }
            }
            
            // Deduct credits and add transaction for each uploaded file
            selectedFiles.forEach((fileObj) => {
                deductCredits(2, userId);
                addTransaction('upload', `Uploaded ${fileObj.name}`, -2, null, userId);
            });
            
            toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
            setSelectedFiles([]);
            
            setTimeout(() => {
                navigate('/myfiles');
            }, 1000);
            
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload files: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 min-h-screen overflow-hidden" style={{backgroundColor: '#f5efff'}}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-normal mb-6">
                    Upload Files
                </h1>

                <div
                    className={`bg-white rounded-lg shadow-sm p-12 mb-6 border-2 border-dashed transition-all ${
                        dragActive 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-300 hover:border-purple-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 mb-4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Drop files here or click to browse
                        </h2>
                        
                        <p className="text-gray-500 text-sm mb-6">
                            Support for single or multiple file uploads. Max 5MB per file.
                        </p>
                        
                        <label className="bg-purple-400 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out cursor-pointer">
                            Select Files
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="*/*"
                            />
                        </label>
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Selected Files ({selectedFiles.length})
                            </h3>
                            <button
                                onClick={() => setSelectedFiles([])}
                                className="text-sm text-red-500 hover:text-red-700"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {selectedFiles.map((fileObj) => (
                                <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {fileObj.preview ? (
                                                <img 
                                                    src={fileObj.preview} 
                                                    alt={fileObj.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {fileObj.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(fileObj.size)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleFileVisibility(fileObj.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                                    fileObj.isPublic
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {fileObj.isPublic ? (
                                                    <span className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
                                                        </svg>
                                                        Public
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                                                        </svg>
                                                        Private
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => removeFile(fileObj.id)}
                                                className="p-1.5 hover:bg-red-100 rounded-lg transition group"
                                                title="Remove"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-red-500 transition">
                                                    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => navigate('/myfiles')}
                                className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                                    uploading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-400 hover:bg-purple-600'
                                }`}
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {selectedFiles.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-500 text-sm">
                            No files selected. Drag and drop files above or click to browse.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
