import React, { useState } from 'react';
import axios from 'axios';
import EvaluationDisplay from './components/EvaluationDisplay';
import Dashboard from './components/Dashboard';
import AnalyticsSection from './components/AnalyticsSection';
import ScoreDisplay from './components/ScoreDisplay';

function App() {
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  

  const handleApiError = (error) => {
    console.error('API Error:', error);
    const errorResponse = error.response?.data;
    
    // Check for specific error types
    if (error.message.includes('getaddrinfo failed')) {
      setError('Network Error: Unable to connect to the analysis service. Please check your internet connection.');
      setDetailedError('Connection to AssemblyAI failed. This might be due to network issues or firewall settings.');
    } else if (error.response?.status === 500) {
      setError('Server Error: The analysis service encountered an error.');
      setDetailedError(errorResponse || 'Internal server error occurred during analysis.');
    } else {
      setError('Error: Failed to analyze the pitch.');
      setDetailedError(error.message || 'Unknown error occurred');
    }
  };

  const handleSingleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus('Starting upload...');
    setError('');
    setDetailedError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading file to server...');
      
      const response = await axios.post('http://localhost:8000/analyze-pitch/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadStatus(`Uploading: ${percentCompleted}%`);
        },
      });
      
      console.log('Response data structure:', response.data);
      setFiles(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        status: 'completed',
        results: response.data,
        timestamp: new Date().toISOString()
      }]);
      setUploadStatus('Analysis complete!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.mp3,.wav,.m4a';
    
    fileInput.onchange = async (e) => {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'uploading',
        statusMessage: 'Starting upload...',
        results: null
      }));

      setFiles(prev => [...prev, ...newFiles]);
      
      for (const fileData of newFiles) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        
        try {
          // Set initial upload status
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { 
                  ...f, 
                  status: 'uploading',
                  statusMessage: 'Uploading file...'
                }
              : f
          ));

          const response = await axios.post('http://localhost:8000/analyze-pitch/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFiles(prev => prev.map(f => 
                f.id === fileData.id 
                  ? {
                      ...f,
                      status: 'uploading',
                      statusMessage: `Uploading: ${percentCompleted}%`
                    }
                  : f
              ));
            },
          });

          // Update status to transcribing
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? {
                  ...f,
                  status: 'transcribing',
                  statusMessage: 'Transcribing audio...'
                }
              : f
          ));

          // Add a delay to show transcribing status
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Update status to analyzing
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? {
                  ...f,
                  status: 'analyzing',
                  statusMessage: 'Analyzing pitch content...'
                }
              : f
          ));

          // Update with final results
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? {
                  ...f,
                  status: 'completed',
                  statusMessage: 'Analysis complete',
                  results: response.data
                }
              : f
          ));

        } catch (error) {
          console.error('Error processing file:', fileData.file.name, error);
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? {
                  ...f,
                  status: 'error',
                  statusMessage: 'Error during analysis',
                  error: error.message
                }
              : f
          ));
        }
      }
    };
    fileInput.click();
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const toggleExpandedView = (id) => {
    setExpandedFileId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pitch Analyzer</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Single</span>
            <button
              onClick={() => setIsMultiMode(!isMultiMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isMultiMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  isMultiMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className="text-sm text-gray-600">Multi</span>
          </div>
        </div>
  
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload & Analysis
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dashboard
          </button>
        </div>
  
        {activeTab === 'upload' ? (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="font-bold">{error}</div>
                {detailedError && (
                  <div className="mt-2 text-sm">
                    Details: {detailedError}
                  </div>
                )}
                <div className="mt-2 text-sm">
                  Troubleshooting steps:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Check your internet connection</li>
                    <li>Verify that the server is running (http://localhost:8000)</li>
                    <li>Try uploading a different file</li>
                    <li>If the problem persists, contact support</li>
                  </ul>
                </div>
              </div>
            )}
  
            {!isMultiMode ? (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload Pitch</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    onChange={handleSingleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600 mb-2">
                        {isLoading ? 'Processing...' : 'Click to upload or drag and drop'}
                      </span>
                      <span className="text-sm text-gray-500">MP3, WAV, or M4A</span>
                      {uploadStatus && (
                        <span className="mt-2 text-blue-600">{uploadStatus}</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Multiple Pitches Analysis</h2>
                    <button
                      onClick={handleMultiFileUpload}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Add Files
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ambitiousness</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Implementation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map(file => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{file.file.name}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full ${
                              file.status === 'completed' ? 'bg-green-100 text-green-800' :
                              file.status === 'error' ? 'bg-red-100 text-red-800' :
                              file.status === 'uploading' ? 'bg-yellow-100 text-yellow-800' :
                              file.status === 'transcribing' ? 'bg-yellow-100 text-yellow-800' :
                              file.status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <span className={`w-2 h-2 mr-2 rounded-full ${
                                file.status === 'completed' ? 'bg-green-600' :
                                file.status === 'error' ? 'bg-red-600' :
                                file.status === 'uploading' ? 'bg-yellow-600' :
                                file.status === 'transcribing' ? 'bg-yellow-600' :
                                file.status === 'analyzing' ? 'bg-yellow-600' :
                                'bg-gray-600'
                              }`}></span>
                              <span className="text-sm font-medium">
                                {file.statusMessage}
                              </span>
                            </span>
                            {file.error && (
                              <span className="block mt-1 text-sm text-red-500">
                                {file.error}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {file.results?.overall_score ? (
                              <ScoreDisplay score={file.results.overall_score} color="blue" />
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {file.results?.ambitiousness_evaluation?.total_ambitiousness_score ? (
                              <ScoreDisplay 
                                score={file.results.ambitiousness_evaluation.total_ambitiousness_score} 
                                color="blue" 
                              />
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {file.results?.implementation_evaluation?.total_implementation_score ? (
                              <ScoreDisplay 
                                score={file.results.implementation_evaluation.total_implementation_score} 
                                color="green" 
                              />
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {file.results?.delivery?.total_delivery_score ? (
                              <ScoreDisplay 
                                score={file.results.delivery.total_delivery_score} 
                                color="yellow" 
                              />
                            ) : (
                              file.results?.delivery_evaluation?.total_delivery_score ? (
                                <ScoreDisplay 
                                  score={file.results.delivery_evaluation.total_delivery_score} 
                                  color="yellow" 
                                />
                              ) : '-'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleExpandedView(file.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                              >
                                {expandedFileId === file.id ? 'Hide' : 'View'}
                              </button>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              {/* Add Analytics Section below the table */}
              {files.length > 0 && <AnalyticsSection files={files} />}
              </div>
            )}
  
            {!isMultiMode && analyses.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                {analyses.map((analysis, index) => (
                  <EvaluationDisplay key={index} evaluation={analysis} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Analyzed Pitches</h2>
              <div className="space-y-4">
                {files.map(file => (
                  <div key={file.id} className="border rounded p-4">
                    <h3 className="font-medium">{file.file.name}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      Status: {file.status}
                      {file.results && (
                        <div className="mt-1">
                          Score: {file.results.overall_score}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Analytics Dashboard</h2>
              <Dashboard files={files} />
            </div>
          </div>
        )}
  
        {uploadStatus && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            error ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <div className="flex items-center">
              {!error && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className={error ? 'text-red-700' : 'text-blue-700'}>
                {uploadStatus}
              </span>
            </div>
          </div>
        )}
  
        {expandedFileId && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white w-4/5 h-4/5 p-8 rounded-lg overflow-auto relative">
              <button
                onClick={() => setExpandedFileId(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
              <h4 className="font-semibold text-xl mb-6">Detailed Analysis</h4>
              {files.find(f => f.id === expandedFileId)?.results && (
                <EvaluationDisplay 
                  evaluation={files.find(f => f.id === expandedFileId).results} 
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;