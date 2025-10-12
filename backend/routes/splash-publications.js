const express = require('express');
const router = express.Router();
const splashPublicationController = require('../controllers/splash-publications.controller');
const auth = require('../middleware/auth');

// Routes publiques (pas d'authentification requise)
router.get('/active', splashPublicationController.getActivePublication);

// Routes admin (authentification requise)
router.use(auth); // Toutes les routes suivantes nécessitent une authentification

router.get('/', splashPublicationController.getAllPublications);
router.post('/', splashPublicationController.upload.single('image'), splashPublicationController.createPublication);
router.put('/:id', splashPublicationController.upload.single('image'), splashPublicationController.updatePublication);
router.delete('/:id', splashPublicationController.deletePublication);
router.patch('/:id/toggle', splashPublicationController.toggleActive);

module.exports = router;