import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  encryptedImage: { 
    type: String, 
    required: true 
  },
  iv: { 
    type: String, 
    required: true 
  },
  encryptionMode: {
    type: String,
    enum: ['ECB', 'CBC', 'CFB', 'OFB', 'CTR'],
    default: 'ECB'
  },
  originalName: { 
    type: String 
  },
  mimeType: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
