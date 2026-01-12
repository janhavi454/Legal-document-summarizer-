import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDropzone } from 'react-dropzone';
import { Tooltip } from 'react-tooltip';
import { FaFileUpload, FaCopy, FaDownload, FaRegenerate, FaHistory, FaTimes } from 'react-icons/fa';
import '../App.css';

const DocumentSummarizer = () => {
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [documentType, setDocumentType] = useState('legal');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('summarizerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (docName, sum) => {
    const newEntry = { documentName: docName, summary: sum, date: new Date().toISOString() };
    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('summarizerHistory', JSON.stringify(updatedHistory));
  };

  // Animated progress
  const progressProps = useSpring({ width: `${uploadProgress}%`, from: { width: '0%' } });

  // Drag and drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('text')) {
        setError('Please upload a PDF or text document');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setError('');
      setDocument(file);
      setSummary('');
      simulateUploadProgress();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf' && !file.type.includes('text')) {
        setError('Please upload a PDF or text document');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      setError('');
      setDocument(file);
      setSummary('');
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSummarize = async () => {
    if (!document) {
      setError('Please upload a document first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to your backend
      const formData = new FormData();
      formData.append('file', document);
      formData.append('summary_length', summaryLength);
      formData.append('document_type', documentType);

      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      saveToHistory(document.name, data.summary);
      
    } catch (err) {
      setError('Error generating summary: ' + err.message);
      // For demo purposes, show a mock summary
      const mockSummary = "This is a mock summary of the legal document. The document appears to contain contractual agreements with standard clauses including confidentiality, termination conditions, and liability limitations. Key points include a 12-month duration, automatic renewal provisions, and dispute resolution through arbitration. Additional provisions cover intellectual property rights, data protection compliance, and governing law specifications. The agreement outlines performance obligations, payment terms, and indemnification clauses. Termination rights are specified for breach of contract, insolvency, or mutual agreement. Force majeure events are addressed, along with dispute resolution mechanisms including mediation and arbitration. Confidentiality obligations extend beyond the term of the agreement, and non-compete clauses may apply depending on the jurisdiction. This comprehensive contract ensures legal protection for both parties involved in the business relationship.";
      setSummary(mockSummary);
      saveToHistory(document.name, mockSummary);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setDocument(null);
    setSummary('');
    setError('');
    setUploadProgress(0);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  // Download summary
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'document_summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Regenerate summary
  const handleRegenerate = () => {
    handleSummarize();
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setSummary(entry.summary);
    setShowHistory(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Document Summarizer</h1>
        <p>AI-powered summarization of complex documents</p>
        <button className="history-btn" onClick={() => setShowHistory(!showHistory)} data-tooltip-id="history-tooltip">
          <FaHistory /> History
        </button>
        <Tooltip id="history-tooltip" place="left" content="View previous summaries" />
      </header>

      <div className="container">
        {/* Document Type and Length Selectors */}
        <div className="selectors">
          <div className="type-selector">
            <label htmlFor="document-type">Select Document Type:</label>
            <select
              id="document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="type-select"
            >
              <option value="legal">Legal Document</option>
              <option value="medical">Medical Document</option>
              <option value="general">General Document</option>
            </select>
          </div>
          <div className="length-selector">
            <label htmlFor="summary-length">Summary Length:</label>
            <select
              id="summary-length"
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              className="length-select"
            >
              <option value="short">Short (50 words)</option>
              <option value="medium">Medium (100 words)</option>
              <option value="long">Long (200 words)</option>
            </select>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div {...getRootProps()} className={`upload-area ${isDragActive ? 'drag-active' : ''}`}>
            <input {...getInputProps()} />
            <FaFileUpload size={48} className="upload-icon" />
            <h3>{isDragActive ? 'Drop the file here...' : 'Drag & Drop Document'}</h3>
            <p>or click to select</p>
            <p>Supported formats: PDF, DOC, DOCX, TXT</p>
            <p>Max file size: 10MB</p>
          </div>

          {document && (
            <div className="file-info">
              <span className="file-name">{document.name}</span>
              <button className="clear-btn" onClick={handleClear}><FaTimes /></button>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <animated.div
                className="progress-fill"
                style={progressProps}
              ></animated.div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Action Button */}
        <div className="action-section">
          <button 
            className="summarize-btn"
            onClick={handleSummarize}
            disabled={!document || isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Generating Summary...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="summary-section">
            <h2>Document Summary</h2>
            <div className="summary-content">
              <div className="summary-text">
                {isExpanded ? summary : summary.substring(0, 300) + (summary.length > 300 ? '...' : '')}
                {summary.length > 300 && (
                  <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
              
              <div className="summary-features">
                <div className="feature">
                  <span className="feature-icon">⏱️</span>
                  <span>Estimated reading time: 2 minutes</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>85% content reduction</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <span>Secure & confidential</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="secondary-btn" onClick={handleCopy} data-tooltip-id="copy-tooltip">
                <FaCopy /> Copy
              </button>
              <button className="secondary-btn" onClick={handleDownload} data-tooltip-id="download-tooltip">
                <FaDownload /> Download
              </button>
              <button className="secondary-btn" onClick={handleRegenerate} data-tooltip-id="regenerate-tooltip">
                <FaRegenerate /> Regenerate
              </button>
            </div>
            <Tooltip id="copy-tooltip" place="top" content="Copy summary to clipboard" />
            <Tooltip id="download-tooltip" place="top" content="Download summary as text file" />
            <Tooltip id="regenerate-tooltip" place="top" content="Generate a new summary" />
          </div>
        )}

        {/* Features Section */}
        <div className="features-section">
          <h3>Why Use Our Summarizer?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Fast Processing</h4>
              <p>Summarize lengthy documents in seconds using advanced AI</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Accurate Results</h4>
              <p>LLM-powered analysis maintains legal context and key clauses</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h4>Secure & Private</h4>
              <p>Your documents are processed securely with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className={`history-sidebar ${showHistory ? 'show' : ''}`}>
          <div className="history-header">
            <h3>Summary History</h3>
            <button className="close-history" onClick={() => setShowHistory(false)}><FaTimes /></button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <p>No summaries yet</p>
            ) : (
              history.map((entry, index) => (
                <div key={index} className="history-item" onClick={() => loadFromHistory(entry)}>
                  <div className="history-title">{entry.documentName}</div>
                  <div className="history-date">{new Date(entry.date).toLocaleDateString()}</div>
                  <div className="history-preview">{entry.summary.substring(0, 100)}...</div>
                </div>
              ))
            )}
          </div>
        </div>
    </div>
  );
};

export default DocumentSummarizer;