const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, getDocuments } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Multer setup for temporary storage
const upload = multer({ dest: 'uploads/' });

router.post('/', protect, upload.single('file'), uploadFile);
router.get('/', protect, getDocuments);

module.exports = router;
