import { useState, useRef } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ onFileParsed, isLoading, autoOpen, compact }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  function handleFile(f) {
    if (!f) return;
    if (!acceptedTypes.includes(f.type)) {
      alert('Please upload a .pdf or .docx file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB');
      return;
    }
    setFile(f);
    onFileParsed(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function clearFile(e) {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div
      className={`file-upload glass-card ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''} ${compact ? 'compact' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isLoading && inputRef.current?.click()}
      id="file-upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
        id="file-upload-input"
      />

      {isLoading ? (
        <div className="file-upload-loading">
          <div className="spinner-ring" style={{ width: 28, height: 28 }} />
          <span>Parsing resume...</span>
        </div>
      ) : file ? (
        <div className="file-upload-info">
          <FileCheck size={22} className="file-icon-success" />
          <div className="file-details">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatSize(file.size)}</span>
          </div>
          <button className="btn-icon btn-ghost" onClick={clearFile} title="Remove file">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="file-upload-prompt">
          <div className="upload-icon-wrap">
            <Upload size={24} />
          </div>
          <div>
            <p className="upload-title">Drop your resume here</p>
            <p className="upload-subtitle">or click to browse — .pdf, .docx (max 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
