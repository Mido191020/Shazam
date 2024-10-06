const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Initialize multer with the defined storage
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Increased limit to 10 MB for larger files
  }
});

// Render the upload form
router.get('/', (req, res) => {
  res.render('index', { title: 'File Upload' });
});

// Handle file upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  console.log('File uploaded:', req.file);
  res.redirect(`/display/${encodeURIComponent(req.file.filename)}`);
});

// Display uploaded file
router.get('/display/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  
  console.log('Attempting to display file:', filePath);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return res.status(404).send('File not found');
  }

  const fileExt = path.extname(filename).toLowerCase();
  let fileType;

  // Determine file type
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
    fileType = 'image';
  } else if (['.mp4', '.webm', '.ogg'].includes(fileExt)) {
    fileType = 'video';
  } else if (['.mp3', '.wav'].includes(fileExt)) {
    fileType = 'audio';
  } else if (['.pdf'].includes(fileExt)) {
    fileType = 'pdf';
  } else {
    fileType = 'other';
  }
  
  console.log('File type determined:', fileType);
  
  // Render the display Pug template with filename, fileType, filePath, and fileExtension
  res.render('display', {
    filename,
    fileType,
    filePath: `/uploads/${filename}`,
    fileExtension: fileExt.substring(1) // Remove the leading dot
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error: ' + err);
});
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

module.exports = router;
