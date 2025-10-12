const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Créer une publication
const createPublication = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Une image est requise' });
    }

    // Désactiver toutes les autres publications actives
    await db.query('UPDATE splash_publication SET is_active = FALSE WHERE is_active = TRUE');

    // Insérer la nouvelle publication
    const imagePath = '/uploads/' + req.file.filename;
    const [result] = await db.query(
      'INSERT INTO splash_publication (userId, title, description, image, publishedAt, is_active) VALUES (?, ?, ?, ?, NOW(), TRUE)',
      [userId, title, description || '', imagePath]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      image: `http://localhost:5000/api/image/${req.file.filename}`,
      is_active: true,
      message: 'Publication créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la publication:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer toutes les publications (admin)
const getAllPublications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT sp.*, u.firstName, u.lastName
      FROM splash_publication sp
      JOIN users u ON sp.userId = u.id
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM splash_publication sp JOIN users u ON sp.userId = u.id';

    const params = [];
    const countParams = [];

    if (search) {
      query += ' WHERE sp.title LIKE ?';
      countQuery += ' WHERE sp.title LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' ORDER BY sp.publishedAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [publications] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    // Convertir les chemins d'images en URLs complètes
    publications.forEach(pub => {
      if (pub.image) {
        if (pub.image.startsWith("/uploads/")) {
          // Déjà au bon format
        } else if (!pub.image.startsWith("http")) {
          // Ancien format : juste le nom du fichier
          pub.image = `/uploads/${pub.image}`;
        }
        // Si c'est déjà une URL complète, on ne fait rien
      }
    });

    res.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des publications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer la publication active (public)
const getActivePublication = async (req, res) => {
  try {
    const [publications] = await db.query(
      'SELECT * FROM splash_publication WHERE is_active = TRUE ORDER BY publishedAt DESC LIMIT 1'
    );

    if (publications.length === 0) {
      return res.json({ active: false });
    }

    const publication = publications[0];
    
    // Convertir le chemin d'image en URL complète
    let imageUrl = publication.image;
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      // Déjà au bon format
    } else if (imageUrl && !imageUrl.startsWith("http")) {
      // Ancien format
      imageUrl = `/uploads/${imageUrl}`;
    }
    
    res.json({
      id: publication.id,
      title: publication.title,
      description: publication.description,
      image: imageUrl,
      updatedAt: publication.updatedAt,
      active: true
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la publication active:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour une publication
const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    let updateQuery = 'UPDATE splash_publication SET title = ?, description = ?, updatedAt = NOW()';
    let params = [title, description || null];

    // Si une nouvelle image est uploadée
    if (req.file) {
      // Supprimer l'ancienne image
      const [oldPublication] = await db.query('SELECT image FROM splash_publication WHERE id = ?', [id]);
      if (oldPublication.length > 0 && oldPublication[0].image) {
        const filename = oldPublication[0].image.replace('/uploads/', '');
        const oldImagePath = path.join(__dirname, '../uploads', filename);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateQuery += ', image = ?';
      params.push('/uploads/' + req.file.filename);
    }

    params.push(id);
    updateQuery += ' WHERE id = ?';

    await db.query(updateQuery, params);

    res.json({ message: 'Publication mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la publication:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer une publication
const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'image pour la supprimer
    const [publication] = await db.query('SELECT image FROM splash_publication WHERE id = ?', [id]);
    if (publication.length > 0 && publication[0].image) {
      const filename = publication[0].image.replace('/uploads/', '');
      const imagePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await db.query('DELETE FROM splash_publication WHERE id = ?', [id]);

    res.json({ message: 'Publication supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Basculer le statut actif d'une publication
const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la publication actuelle
    const [publications] = await db.query('SELECT is_active FROM splash_publication WHERE id = ?', [id]);
    if (publications.length === 0) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    const currentStatus = publications[0].is_active;

    if (currentStatus) {
      // Désactiver cette publication
      await db.query('UPDATE splash_publication SET is_active = FALSE WHERE id = ?', [id]);
      res.json({ is_active: false, message: 'Publication désactivée' });
    } else {
      // Désactiver toutes les autres publications et activer celle-ci
      await db.query('UPDATE splash_publication SET is_active = FALSE WHERE is_active = TRUE');
      await db.query('UPDATE splash_publication SET is_active = TRUE WHERE id = ?', [id]);
      res.json({ is_active: true, message: 'Publication activée' });
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createPublication,
  getAllPublications,
  getActivePublication,
  updatePublication,
  deletePublication,
  toggleActive,
  upload
};