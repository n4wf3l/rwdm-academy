const express = require('express');
const router = express.Router();
const splashPublicationController = require('../controllers/splash-publications.controller');
const auth = require('../middleware/auth');

// Routes publiques (pas d'authentification requise)
router.get('/active', splashPublicationController.getActivePublication);

// Routes admin (authentification requise)
router.use(auth); // Toutes les routes suivantes nécessitent une authentification

router.get('/', splashPublicationController.getAllPublications);
router.post('/', (req, res, next) => {
  splashPublicationController.upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'L\'image est trop volumineuse (max 20MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, splashPublicationController.createPublication);
router.put('/:id', (req, res, next) => {
  splashPublicationController.upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'L\'image est trop volumineuse (max 20MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, splashPublicationController.updatePublication);
router.delete('/:id', splashPublicationController.deletePublication);
router.patch('/:id/toggle', splashPublicationController.toggleActive);

module.exports = router;