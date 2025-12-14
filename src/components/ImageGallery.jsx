import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Images, 
  Lock, 
  Calendar, 
  FileType, 
  Unlock, 
  Trash2, 
  RefreshCw,
  ShieldCheck,
  Loader,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Function to generate a visual representation of encrypted data
const generateEncryptedImagePreview = (encryptedData, width = 200, height = 150) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Use encrypted data bytes to create a scrambled visual pattern
  const bytes = atob(encryptedData.substring(0, Math.min(encryptedData.length, 40000)));
  const imageData = ctx.createImageData(width, height);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const byteIndex = Math.floor(i / 4) % bytes.length;
    const byteValue = bytes.charCodeAt(byteIndex);
    
    // Create colorful noise pattern from encrypted bytes
    imageData.data[i] = (byteValue * 7) % 256;     // R
    imageData.data[i + 1] = (byteValue * 13) % 256; // G
    imageData.data[i + 2] = (byteValue * 17) % 256; // B
    imageData.data[i + 3] = 255;                     // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

export default function ImageGallery({ refreshTrigger, onDecryptClick }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [encryptedPreviews, setEncryptedPreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState({});

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/images`);
      setImages(response.data);
      
      // Fetch encrypted previews for all images
      response.data.forEach(image => {
        fetchEncryptedPreview(image._id);
      });
    } catch (error) {
      console.error('Failed to fetch images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEncryptedPreview = async (imageId) => {
    if (encryptedPreviews[imageId] || loadingPreviews[imageId]) return;
    
    setLoadingPreviews(prev => ({ ...prev, [imageId]: true }));
    try {
      const response = await axios.get(`${API_URL}/images/${imageId}/encrypted`);
      const preview = generateEncryptedImagePreview(response.data.encryptedData);
      setEncryptedPreviews(prev => ({ ...prev, [imageId]: preview }));
    } catch (error) {
      console.error('Failed to fetch encrypted preview:', error);
    } finally {
      setLoadingPreviews(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const handleDownload = async (image) => {
    try {
      // Download the encrypted visual preview as a PNG image
      if (encryptedPreviews[image._id]) {
        const link = document.createElement('a');
        link.href = encryptedPreviews[image._id];
        link.download = `${image.name}_encrypted.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Encrypted image downloaded!');
      } else {
        // Fetch and generate the preview first
        const response = await axios.get(`${API_URL}/images/${image._id}/encrypted`);
        const preview = generateEncryptedImagePreview(response.data.encryptedData);
        const link = document.createElement('a');
        link.href = preview;
        link.download = `${image.name}_encrypted.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Encrypted image downloaded!');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download encrypted image');
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/images/${id}`);
      toast.success('Image deleted successfully');
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <section className="gallery-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Images className="section-title-icon" size={28} />
          Encrypted Images
          {images.length > 0 && (
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              color: 'var(--text-secondary)',
              marginLeft: '0.5rem'
            }}>
              ({images.length})
            </span>
          )}
        </h2>
        <motion.button
          className="btn btn-secondary"
          onClick={fetchImages}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          Refresh
        </motion.button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <Loader size={48} className="spinning" style={{ margin: '0 auto 1rem' }} />
          <p>Loading encrypted images...</p>
        </div>
      ) : images.length === 0 ? (
        <motion.div 
          className="glass-card empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ShieldCheck size={80} className="empty-state-icon" />
          <h3 className="empty-state-title">No encrypted images yet</h3>
          <p className="empty-state-text">
            Upload your first image to encrypt it with AES-256 encryption
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="gallery-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image._id}
                className="image-card"
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="image-card-visual" style={{ position: 'relative', overflow: 'hidden' }}>
                  {loadingPreviews[image._id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Loader size={32} className="spinning" style={{ color: 'var(--primary)' }} />
                    </div>
                  ) : encryptedPreviews[image._id] ? (
                    <>
                      <img 
                        src={encryptedPreviews[image._id]} 
                        alt="Encrypted preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'contrast(1.2) saturate(1.3)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        padding: '0.75rem',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Lock size={28} style={{ color: 'var(--primary)' }} />
                      </div>
                    </>
                  ) : (
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: 'easeInOut' 
                      }}
                    >
                      <Lock size={48} className="encrypted-icon" />
                    </motion.div>
                  )}
                </div>
                
                <div className="image-card-body">
                  <h3 className="image-card-name">{image.name}</h3>
                  
                  <div className="image-card-meta">
                    <span className="meta-badge mode">
                      <ShieldCheck size={12} />
                      {image.encryptionMode}
                    </span>
                    <span className="meta-badge">
                      <FileType size={12} />
                      {image.originalName?.split('.').pop()?.toUpperCase() || 'IMG'}
                    </span>
                    <span className="meta-badge">
                      <Calendar size={12} />
                      {formatDate(image.createdAt)}
                    </span>
                  </div>

                  <div className="image-card-actions">
                    <motion.button
                      className="btn btn-primary btn-sm"
                      onClick={() => onDecryptClick(image)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ flex: 1 }}
                    >
                      <Unlock size={16} />
                      Decrypt
                    </motion.button>
                    <motion.button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(image)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Download encrypted file"
                    >
                      <Download size={16} />
                    </motion.button>
                    <motion.button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDelete(image._id, image.name)}
                      disabled={deletingId === image._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete image"
                    >
                      {deletingId === image._id ? (
                        <div className="spinner" style={{ width: 16, height: 16 }} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
