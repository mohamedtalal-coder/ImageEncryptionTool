import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Download, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DecryptModal({ image, onClose }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [error, setError] = useState('');

  const handleDecrypt = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setIsDecrypting(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/decrypt/${image._id}`, {
        password
      });
      
      setDecryptedImage(response.data.image);
      toast.success('Image decrypted successfully!');
    } catch (error) {
      console.error('Decryption error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to decrypt image';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedImage) return;

    const link = document.createElement('a');
    link.href = decryptedImage;
    link.download = image.originalName || `${image.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {decryptedImage ? (
              <>
                <Unlock size={24} style={{ marginRight: '0.5rem', color: 'var(--success)' }} />
                Decrypted Image
              </>
            ) : (
              <>
                <Lock size={24} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                Decrypt Image
              </>
            )}
          </h2>
          <motion.button
            className="modal-close"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="modal-body">
          {!decryptedImage ? (
            <>
              <div style={{ 
                background: 'var(--surface-light)', 
                padding: '1rem', 
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{image.name}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="meta-badge mode">
                    <ShieldCheck size={12} />
                    {image.encryptionMode}
                  </span>
                  <span className="meta-badge">
                    {image.originalName}
                  </span>
                </div>
              </div>

              <form onSubmit={handleDecrypt}>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Enter Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter your encryption password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      autoFocus
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

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--accent)'
                    }}
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}

                <div className="modal-footer" style={{ marginTop: '1.5rem', justifyContent: 'stretch' }}>
                  <motion.button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isDecrypting || !password}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 2 }}
                  >
                    {isDecrypting ? (
                      <>
                        <div className="spinner" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Unlock size={20} />
                        Decrypt Image
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="decrypted-image-container"
              >
                <img 
                  src={decryptedImage} 
                  alt={image.name} 
                  className="decrypted-image" 
                />
              </motion.div>

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
                <motion.button
                  type="button"
                  className="btn btn-success"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={20} />
                  Download Image
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
