import React, { useState, useEffect } from 'react';

interface ConnectionStatus {
  backend: 'checking' | 'connected' | 'error';
  database: 'checking' | 'connected' | 'error';
  message: string;
}

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'checking',
    database: 'checking',
    message: 'Testing connection...'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-domain.vercel.app';

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test backend connection
      const response = await fetch(`${API_URL}/api/status`);
      
      if (response.ok) {
        const data = await response.json();
        
        setStatus({
          backend: 'connected',
          database: data.mongodb_connected ? 'connected' : 'error',
          message: data.mongodb_connected 
            ? '✅ Backend and database connected successfully!' 
            : '⚠️ Backend connected but database connection failed'
        });
      } else {
        setStatus({
          backend: 'error',
          database: 'error',
          message: `❌ Backend connection failed: ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      setStatus({
        backend: 'error',
        database: 'error',
        message: `❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Backend API:</span>
          <span className={`font-medium ${getStatusColor(status.backend)}`}>
            {getStatusIcon(status.backend)} {status.backend}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Database:</span>
          <span className={`font-medium ${getStatusColor(status.database)}`}>
            {getStatusIcon(status.database)} {status.database}
          </span>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">{status.message}</p>
        </div>
        
        <div className="text-xs text-gray-500">
          Backend URL: {API_URL}
        </div>
        
        <button 
          onClick={testConnection}
          className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Again
        </button>
      </div>
    </div>
  );
};

export default ConnectionTest; 