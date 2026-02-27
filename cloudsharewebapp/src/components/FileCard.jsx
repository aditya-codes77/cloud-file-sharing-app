import React from 'react';

const FileCard = ({ file, onDownload, onToggle, onDelete }) => {
    // Get file extension
    const getFileExtension = (filename) => {
        return filename.split('.').pop().toUpperCase() || 'FILE';
    };

    // Get file type icon based on MIME type or extension
    const getFileIcon = (type, filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        
        // Image files
        if (type?.startsWith('image/')) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
        
        // PDF files
        if (type === 'application/pdf' || extension === 'pdf') {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <text x="12" y="17" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor" className="text-red-500">PDF</text>
                </svg>
            );
        }
        
        // Document files (Word, Excel, etc.)
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-500">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="6" y1="12" x2="18" y2="12" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="6" y1="16" x2="18" y2="16" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            );
        }
        
        // Video files
        if (type?.startsWith('video/')) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                    <polygon points="23 7 16 12 23 17 23 7" fill="currentColor"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                </svg>
            );
        }
        
        // Audio files
        if (type?.startsWith('audio/')) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500">
                    <path d="M9 18v-13h4v13M4 9h2M18 9h2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="9" r="7" strokeWidth="2" fill="none"/>
                </svg>
            );
        }
        
        // Default file icon
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        if (kb >= 1) return `${kb.toFixed(2)} KB`;
        return `${bytes} B`;
    };

    // Format upload date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border-2 border-gray-100 group flex flex-col min-h-48">
            {/* Upper Part - Icon Section with Custom Background (80% height) */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-green-100">
                {getFileIcon(file.type, file.name)}
                
                {/* Hover Overlay - Very Light Gray */}
                <div className="absolute inset-0 bg-gray-200 bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {/* Download Button */}
                    <button 
                        onClick={() => onDownload(file)}
                        className="bg-white p-1 rounded-full hover:bg-gray-100 transition" 
                        title="Download"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    {/* Toggle Public/Private Button */}
                    <button 
                        onClick={() => onToggle(file.id)}
                        className="bg-white p-1 rounded-full hover:bg-gray-100 transition" 
                        title={file.isPublic || file.public ? "Make Private" : "Make Public"}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={file.isPublic || file.public ? "text-green-500" : "text-gray-500"}>
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    {/* Delete Button */}
                    <button 
                        onClick={() => onDelete(file.id)}
                        className="bg-white p-1 rounded-full hover:bg-gray-100 transition" 
                        title="Delete"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500">
                            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Lower Part - File Info (20% height) */}
            <div className="p-0.5">
                <div className="mb-0">
                    {/* File Name */}
                    <h3 className="text-xs font-medium text-gray-800 truncate" title={file.name}>
                        {file.name}
                    </h3>
                    
                    {/* File Format */}
                    <p className="text-xs text-gray-500 font-semibold leading-none">
                        {getFileExtension(file.name)}
                    </p>
                </div>

                {/* File Size */}
                <p className="text-xs text-gray-600 leading-none">
                    {formatFileSize(file.size)}
                </p>

                {/* Upload Date */}
                <p className="text-xs text-gray-400 leading-none">
                    {formatDate(file.uploadedAt)}
                </p>
            </div>
        </div>
    );
};

export default FileCard;
