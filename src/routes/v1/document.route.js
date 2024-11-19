const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const authDoctor = require('../../middlewares/authDoctor');
const authdoctorVerified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const documentValidation = require('../../validations/document.validation');
const documentService = require('../../services/document.service');
// Set up multer for file handling

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter,
});

// Set up Cloudinary for image uploading
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

router.post(
  '/upload',
  authDoctor(),
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'esign', maxCount: 1 },
    { name: 'medicalDegree', maxCount: 1 },
    { name: 'medicalRegistration', maxCount: 1 },
    { name: 'aadharCardDoc', maxCount: 1 },
    { name: 'pancardDoc', maxCount: 1 },
    { name: 'ifsc', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const promises = Object.entries(req.files).map(async ([field, [file]]) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: field });
        return { field, result };
      });

      const results = await Promise.all(promises);
      const data = Object.fromEntries(results.map(({ field, result }) => [field, result.secure_url]));

      const auth = req.SubjectId;
      const updated = await documentService.Upload(
        data.resume,
        data.esign,
        data.ifsc,
        data.medicalDegree,
        data.medicalRegistration,
        data.aadharCardDoc,
        data.pancardDoc,
        auth
      );

      if (updated) {
        res.status(200).json({ message: 'Documents uploaded successfully', updated });
      } else {
        res.status(500).json({ message: 'Failed to upload documents' });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get('/view/:doctype', validate(documentValidation.documentUrl), authDoctor(), async (req, res) => {
  // Upload image to Cloudinary
  const documentUrl = await documentService.getDocumentUrl(req.SubjectId, req.params.doctype);
  if (documentUrl) {
    res.status(200).json({ documentUrl });
  } else {
    res.status(401).json({ message: 'Sorry, Document Error' });
  }
});
// router.post(
//   '/update-esign',
//   authdoctorVerified(),
//   photoUploadService.uploadPhoto.fields([{ name: 'esign', maxCount: 1 }]),
//   documentController.updateEsign
// );

router.post('/update-esign', authdoctorVerified(), upload.single('esign'), async (req, res, next) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'esign' });

    // Call the controller method to update the esign field in the database
    const auth = req.SubjectId;
    const updated = await documentService.updateEsign(result.secure_url, auth);

    // Check if the update was successful
    if (updated) {
      res.status(200).json({ message: 'Esign updated', esignlocation: result.secure_url });
    } else {
      res.status(500).json({ message: 'Failed to update Esign' });
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
