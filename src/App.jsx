import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import DecryptModal from './components/DecryptModal';
import { Shield } from 'lucide-react';
import './index.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDecryptClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="app-container">
      {/* Animated Background Orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#f8fafc',
            },
          },
        }}
      />

      <main className="main-content">
        {/* Header */}
        <motion.header
          className="header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Shield size={60} className="header-icon" style={{ margin: '0 auto 1rem', color: '#6366f1' }} />
          </motion.div>
          <h1 className="header-title">Image Encryption Tool</h1>
          <p className="header-subtitle">
            Secure your images with AES-256 encryption • Multiple cipher modes supported
          </p>
        </motion.header>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </motion.div>

        {/* Gallery Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ImageGallery
            refreshTrigger={refreshTrigger}
            onDecryptClick={handleDecryptClick}
          />
        </motion.div>
      </main>

      {/* Decrypt Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <DecryptModal
            image={selectedImage}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
