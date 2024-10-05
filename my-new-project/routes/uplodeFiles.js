// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// /* GET users listing. */
// router.get('/', (req, res) => {
//   res.render('index', { title: 'File Upload' });
// });

// router.post('/upload',upload.single('file'),(req,res)=>{
//   if(!req.file){
//     return res.status(400).send('the file not uploded')
//   }
//   res.redirect(`/display/${req.file.filename}`);
// })
// router.get('/display/:filename', (req, res) => {
//   const filename = req.params.filename;
//   res.render('display', { filename }); // Render a Pug template with the filename
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  res.render('index', { title: 'File Upload' });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  console.log('File uploaded:', req.file);
  res.redirect(`/display/${encodeURIComponent(req.file.filename)}`);
});

router.get('/display/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  console.log('Attempting to display file:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return res.status(404).send('File not found');
  }

  const fileExt = path.extname(filename).toLowerCase();
  
  let fileType;
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
    fileType = 'image';
  } else if (['.mp4', '.webm', '.ogg'].includes(fileExt)) {
    fileType = 'video';
  } else {
    fileType = 'unknown';
  }
  
  console.log('File type determined:', fileType);
  res.render('display', { filename, fileType });
});

module.exports = router;
