import express from 'express';
import bcrypt from 'bcrypt';
import Image from '../models/Image.js';
import upload from '../middleware/upload.js';
import { encryptImage, decryptImage } from '../utils/encryption.js';

const router = express.Router();

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, password, mode } = req.body;
    const imageFile = req.file;
    const encryptionMode = mode || 'CBC';

    if (!name || !password || !imageFile) {
      return res.status(400).json({ 
        error: 'Name, password, and image are required' 
      });
    }

    const validModes = ['ECB', 'CBC', 'CFB', 'OFB', 'CTR'];
    if (!validModes.includes(encryptionMode.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid mode. Use: ECB, CBC, CFB, OFB, or CTR' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { iv, encryptedData } = encryptImage(imageFile.buffer, encryptionMode);

    const newImage = new Image({
      name,
      password: hashedPassword,
      encryptedImage: encryptedData,
      iv,
      encryptionMode: encryptionMode.toUpperCase(),
      originalName: imageFile.originalname,
      mimeType: imageFile.mimetype
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded and encrypted successfully',
      data: {
        id: newImage._id,
        name: newImage.name,
        hashedPassword: newImage.password,
        encryptedImagePreview: encryptedData.substring(0, 100) + '...',
        iv: newImage.iv,
        encryptionMode: newImage.encryptionMode,
        originalName: newImage.originalName,
        createdAt: newImage.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload and encrypt image' });
  }
});

router.get('/images', async (req, res) => {
  try {
    const images = await Image.find().select('-encryptedImage -password');
    res.json(images);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get encrypted image data for display (shows scrambled/encrypted visual)
router.get('/images/:id/encrypted', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({
      encryptedData: image.encryptedImage,
      originalName: image.originalName,
      mimeType: image.mimeType
    });
  } catch (error) {
    console.error('Get encrypted image error:', error);
    res.status(500).json({ error: 'Failed to get encrypted image' });
  }
});

// Download encrypted file
router.get('/images/:id/download', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const encryptedBuffer = Buffer.from(image.encryptedImage, 'base64');
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${image.name}_encrypted.enc"`);
    res.send(encryptedBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download encrypted image' });
  }
});

router.post('/decrypt/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, image.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const decryptedBuffer = decryptImage(image.encryptedImage, image.iv, image.encryptionMode);
    const base64Image = decryptedBuffer.toString('base64');

    res.json({
      message: 'Image decrypted successfully',
      image: `data:${image.mimeType};base64,${base64Image}`,
      originalName: image.originalName,
      encryptionMode: image.encryptionMode
    });

  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Failed to decrypt image' });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
