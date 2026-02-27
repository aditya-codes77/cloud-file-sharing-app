import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fileAPI } from "../services/api";

const Dashboard = () => {
  const { getToken, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    recentFiles: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch files to calculate stats
      const response = await fileAPI.getFiles(token);
      const files = response.files || response.data || response || [];
      
      // Calculate stats
      const totalFiles = files.length;
      const storageUsed = files.reduce((acc, file) => acc + (file.size || 0), 0);
      const recentFiles = files
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 5);
      
      setStats({
        totalFiles,
        storageUsed,
        storageLimit: 5 * 1024 * 1024 * 1024,
        recentFiles
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;
  
  return (
    <div className="p-4 min-h-screen overflow-hidden" style={{backgroundColor: '#f5efff'}}>   
      <h1 className="text-2xl font-normal mb-6">
        Dashboard
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Files Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Files</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalFiles}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Storage Used Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-800">{formatFileSize(stats.storageUsed)}</p>
                  <p className="text-xs text-gray-400 mt-1">of {formatFileSize(stats.storageLimit)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {/* Storage Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{storagePercentage.toFixed(1)}% used</p>
            </div>

            {/* Quick Action Card */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-sm p-6 text-white">
              <p className="text-sm mb-2 opacity-90">Ready to upload?</p>
              <p className="text-xl font-bold mb-4">Share your files securely</p>
              <button 
                onClick={() => navigate('/upload')}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
              >
                Upload Files
              </button>
            </div>
          </div>

          {/* Recent Files Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Files</h2>
              <button 
                onClick={() => navigate('/myfiles')}
                className="text-sm text-purple-500 hover:text-purple-700 font-medium"
              >
                View All →
              </button>
            </div>

            {stats.recentFiles.length === 0 ? (
              <div className="text-center py-8">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300 mx-auto mb-3">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-gray-500 text-sm">No files uploaded yet</p>
                <button 
                  onClick={() => navigate('/upload')}
                  className="mt-3 text-purple-500 hover:text-purple-700 text-sm font-medium"
                >
                  Upload your first file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name || file.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {file.public || file.isPublic ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500 flex-shrink-0">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Pro Tip</p>
                <p className="text-sm text-blue-700">
                  Make files public to share them with anyone via a link. Private files are only accessible by you.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
