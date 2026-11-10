// const multer = require('multer');

// // Store files in memory (as buffer) before uploading to Cloudinary
// const storage = multer.memoryStorage();

// // File filter - only allow PDFs and videos
// const fileFilter = (req, file, cb) => {
//   // PDF files
//   if (file.fieldname === 'pdf') {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed for documents'), false);
//     }
//   }
  
//   // Video files
//   if (file.fieldname === 'video') {
//     const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
//     if (allowedVideoTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only MP4, MOV, AVI, MPEG video files are allowed'), false);
//     }
//   }
// };

// // Multer configuration
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024 // 50MB max file size
//   }
// });

// module.exports = upload;





const multer = require('multer'); 
 
// Store files in memory (as buffer) before uploading 
const storage = multer.memoryStorage(); 
 
// File filter - allow PDFs, videos, and ZIPs
const fileFilter = (req, file, cb) => { 
  // PDF files 
  if (file.fieldname === 'pdf') { 
    if (file.mimetype === 'application/pdf') { 
      cb(null, true); 
    } else { 
      cb(new Error('Only PDF files are allowed for documents'), false); 
    } 
  } 
   
  // Video files 
  if (file.fieldname === 'video') { 
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']; 
    if (allowedVideoTypes.includes(file.mimetype)) { 
      cb(null, true); 
    } else { 
      cb(new Error('Only MP4, MOV, AVI, MPEG video files are allowed'), false); 
    } 
  }
  
  // ⭐ NEW: ZIP files
  if (file.fieldname === 'zip') {
    const allowedZipTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-zip',
      'multipart/x-zip'
    ];
    if (allowedZipTypes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed for project code'), false);
    }
  }
}; 
 
// Multer configuration 
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: { 
    fileSize: 500 * 1024 * 1024 // ⭐ UPDATED: 500MB max file size (for ZIPs)
  } 
}); 
 
module.exports = upload;