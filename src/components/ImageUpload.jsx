import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Lock, Eye, EyeOff, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ENCRYPTION_MODES = ['ECB', 'CBC', 'CFB', 'OFB', 'CTR'];

export default function ImageUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('CBC');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
      
      // Auto-fill name from filename
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setName(fileName);
    } else {
      toast.error('Please select a valid image file');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setName('');
    setPassword('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !name || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('password', password);
    formData.append('mode', mode);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      toast.success('Image encrypted and uploaded successfully!');
      clearFile();
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-section glass-card">
      <form onSubmit={handleSubmit}>
        <div className="upload-grid">
          {/* Left: Drop Zone / Preview */}
          <div>
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    animate={{ 
                      y: isDragging ? -10 : 0,
                      scale: isDragging ? 1.1 : 1 
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Upload className="upload-icon" size={64} />
                  </motion.div>
                  <p className="upload-text">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                  </p>
                  <p className="upload-hint">or click to browse files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="image-preview-container"
                >
                  <img src={preview} alt="Preview" className="image-preview" />
                  <div className="image-preview-overlay">
                    <span className="image-name">{file?.name}</span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={clearFile}
                    className="btn btn-danger"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.5rem',
                      borderRadius: '50%',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Form Fields */}
          <div>
            <div className="form-group">
              <label className="form-label">
                <ImageIcon size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Image Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter a name for your image"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Encryption Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Encryption Mode
              </label>
              <div className="mode-grid">
                {ENCRYPTION_MODES.map((m) => (
                  <motion.div
                    key={m}
                    className={`mode-option ${mode === m ? 'selected' : ''}`}
                    onClick={() => setMode(m)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {m}
                  </motion.div>
                ))}
              </div>
            </div>

            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="progress-bar"
              >
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={!file || !name || !password || isUploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: '1.5rem' }}
            >
              {isUploading ? (
                <>
                  <div className="spinner" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Encrypt & Upload
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
