const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    console.log('Upload directory:', uploadDir);
    console.log('Upload directory exists:', fs.existsSync(uploadDir));
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // Augmenté à 20MB
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
    console.log('Files received:', req.files);
    console.log('File received:', req.file);
    console.log('Body received:', req.body);
    console.log('User:', req.user);

    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.error('User ID not found in request');
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    console.log('Creating publication for userId:', userId);
    console.log('Raw title:', title);
    console.log('Raw description:', description);

    if (!req.file) {
      return res.status(400).json({ error: 'Une image est requise' });
    }

    // Parser les données JSON reçues depuis FormData
    let parsedTitle, parsedDescription;
    try {
      parsedTitle = typeof title === 'string' ? JSON.parse(title) : title;
      parsedDescription = description ? (typeof description === 'string' ? JSON.parse(description) : description) : null;
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(400).json({ error: 'Données JSON invalides' });
    }

    console.log('Parsed title:', parsedTitle);
    console.log('Parsed description:', parsedDescription);

    if (!parsedTitle || !parsedTitle.fr) {
      return res.status(400).json({ error: 'Le titre en français est requis' });
    }

    // Vérifier que l'utilisateur existe
    try {
      const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        console.error('User not found in database:', userId);
        return res.status(400).json({ error: 'Utilisateur non trouvé' });
      }
    } catch (userCheckError) {
      console.error('Error checking user:', userCheckError);
      return res.status(500).json({ error: 'Erreur lors de la vérification de l\'utilisateur' });
    }

    // Insérer la nouvelle publication (inactive par défaut)
    const imagePath = '/uploads/' + req.file.filename;
    const titleJson = JSON.stringify(parsedTitle);
    const descriptionJson = parsedDescription ? JSON.stringify(parsedDescription) : null;

    console.log('Inserting with params:', [userId, titleJson, descriptionJson, imagePath]);

    try {
      const [result] = await db.query(
        'INSERT INTO splash_publication (userId, title, description, image, publishedAt, is_active) VALUES (?, ?, ?, ?, NOW(), FALSE)',
        [userId, titleJson, descriptionJson, imagePath]
      );

      console.log('Insert result:', result);

      res.status(201).json({
        id: result.insertId,
        title: parsedTitle,
        description: parsedDescription,
        image: `http://localhost:5000/api/image/${req.file.filename}`,
        is_active: false,
        message: 'Publication créée avec succès (inactive)'
      });
    } catch (dbError) {
      console.error('Database insertion error:', dbError);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion en base de données: ' + dbError.message });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la publication:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
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

    // Convertir les chemins d'images en URLs complètes et parser le JSON
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
      
      // Parser le JSON des titres et descriptions de manière plus robuste
      if (typeof pub.title === 'string') {
        try {
          pub.title = JSON.parse(pub.title);
        } catch (e) {
          // Si ce n'est pas du JSON valide, créer un objet avec la string comme français
          pub.title = { fr: pub.title || '' };
        }
      } else if (typeof pub.title === 'object' && pub.title !== null) {
        // Vérifier si c'est un objet avec des indices numériques (données corrompues)
        const keys = Object.keys(pub.title);
        const hasNumericKeys = keys.some(key => !isNaN(Number(key)));
        const hasLanguageKeys = keys.some(key => ['fr', 'en', 'nl'].includes(key));
        
        if (hasNumericKeys && hasLanguageKeys) {
          // Objet hybride : garder seulement les clés de langue
          const cleanTitle = {};
          if (pub.title.fr) cleanTitle.fr = pub.title.fr;
          if (pub.title.en) cleanTitle.en = pub.title.en;
          if (pub.title.nl) cleanTitle.nl = pub.title.nl;
          pub.title = cleanTitle;
        } else if (hasNumericKeys && keys.length > 0) {
          // Seulement des indices numériques : reconstruire la string
          const charArray = [];
          keys.sort((a, b) => Number(a) - Number(b)).forEach(key => {
            charArray[Number(key)] = pub.title[key];
          });
          const reconstructedString = charArray.join('');
          try {
            pub.title = JSON.parse(reconstructedString);
          } catch (e) {
            pub.title = { fr: reconstructedString || '' };
          }
        }
        // Si c'est déjà un objet propre avec des clés de langue, le garder tel quel
      } else if (typeof pub.title !== 'object' || pub.title === null) {
        // Si ce n'est ni une string ni un objet, créer un objet par défaut
        pub.title = { fr: '' };
      }
      // Assurer que c'est toujours un objet avec au moins la clé 'fr'
      if (typeof pub.title === 'object' && pub.title !== null && !pub.title.fr) {
        pub.title.fr = '';
      }
      
      if (pub.description) {
        if (typeof pub.description === 'string') {
          try {
            pub.description = JSON.parse(pub.description);
          } catch (e) {
            pub.description = { fr: pub.description };
          }
        } else if (typeof pub.description === 'object' && pub.description !== null) {
          // Vérifier si c'est un objet avec des indices numériques (données corrompues)
          const keys = Object.keys(pub.description);
          const hasNumericKeys = keys.some(key => !isNaN(Number(key)));
          const hasLanguageKeys = keys.some(key => ['fr', 'en', 'nl'].includes(key));
          
          if (hasNumericKeys && hasLanguageKeys) {
            // Objet hybride : garder seulement les clés de langue
            const cleanDescription = {};
            if (pub.description.fr) cleanDescription.fr = pub.description.fr;
            if (pub.description.en) cleanDescription.en = pub.description.en;
            if (pub.description.nl) cleanDescription.nl = pub.description.nl;
            pub.description = cleanDescription;
          } else if (hasNumericKeys && keys.length > 0) {
            // Seulement des indices numériques : reconstruire la string
            const charArray = [];
            keys.sort((a, b) => Number(a) - Number(b)).forEach(key => {
              charArray[Number(key)] = pub.description[key];
            });
            const reconstructedString = charArray.join('');
            try {
              pub.description = JSON.parse(reconstructedString);
            } catch (e) {
              pub.description = { fr: reconstructedString || '' };
            }
          }
        }
        // Assurer que c'est toujours un objet avec au moins la clé 'fr'
        if (typeof pub.description === 'object' && pub.description !== null && !pub.description.fr) {
          pub.description.fr = '';
        }
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
      'SELECT sp.*, u.firstName, u.lastName FROM splash_publication sp JOIN users u ON sp.userId = u.id WHERE sp.is_active = TRUE ORDER BY sp.publishedAt DESC LIMIT 1'
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
    
    // Parser le JSON des titres et descriptions de manière plus robuste
    let title, description;
    
    if (typeof publication.title === 'string') {
      try {
        title = JSON.parse(publication.title);
      } catch (e) {
        title = { fr: publication.title || '' };
      }
    } else if (typeof publication.title === 'object' && publication.title !== null) {
      // Vérifier si c'est un objet avec des indices numériques (données corrompues)
      const keys = Object.keys(publication.title);
      const hasNumericKeys = keys.some(key => !isNaN(Number(key)));
      const hasLanguageKeys = keys.some(key => ['fr', 'en', 'nl'].includes(key));
      
      if (hasNumericKeys && hasLanguageKeys) {
        // Objet hybride : garder seulement les clés de langue
        const cleanTitle = {};
        if (publication.title.fr) cleanTitle.fr = publication.title.fr;
        if (publication.title.en) cleanTitle.en = publication.title.en;
        if (publication.title.nl) cleanTitle.nl = publication.title.nl;
        title = cleanTitle;
      } else if (hasNumericKeys && keys.length > 0) {
        // Seulement des indices numériques : reconstruire la string
        const charArray = [];
        keys.sort((a, b) => Number(a) - Number(b)).forEach(key => {
          charArray[Number(key)] = publication.title[key];
        });
        const reconstructedString = charArray.join('');
        try {
          title = JSON.parse(reconstructedString);
        } catch (e) {
          title = { fr: reconstructedString || '' };
        }
      } else {
        title = publication.title;
      }
    } else {
      title = { fr: '' };
    }
    // Assurer que c'est toujours un objet avec au moins la clé 'fr'
    if (typeof title === 'object' && title !== null && !title.fr) {
      title.fr = '';
    }
    
    if (publication.description) {
      if (typeof publication.description === 'string') {
        try {
          description = JSON.parse(publication.description);
        } catch (e) {
          description = { fr: publication.description };
        }
      } else if (typeof publication.description === 'object' && publication.description !== null) {
        // Vérifier si c'est un objet avec des indices numériques (données corrompues)
        const keys = Object.keys(publication.description);
        const hasNumericKeys = keys.some(key => !isNaN(Number(key)));
        const hasLanguageKeys = keys.some(key => ['fr', 'en', 'nl'].includes(key));
        
        if (hasNumericKeys && hasLanguageKeys) {
          // Objet hybride : garder seulement les clés de langue
          const cleanDescription = {};
          if (publication.description.fr) cleanDescription.fr = publication.description.fr;
          if (publication.description.en) cleanDescription.en = publication.description.en;
          if (publication.description.nl) cleanDescription.nl = publication.description.nl;
          description = cleanDescription;
        } else if (hasNumericKeys && keys.length > 0) {
          // Seulement des indices numériques : reconstruire la string
          const charArray = [];
          keys.sort((a, b) => Number(a) - Number(b)).forEach(key => {
            charArray[Number(key)] = publication.description[key];
          });
          const reconstructedString = charArray.join('');
          try {
            description = JSON.parse(reconstructedString);
          } catch (e) {
            description = { fr: reconstructedString || '' };
          }
        } else {
          description = publication.description;
        }
      } else {
        description = { fr: '' };
      }
      // Assurer que c'est toujours un objet avec au moins la clé 'fr'
      if (typeof description === 'object' && description !== null && !description.fr) {
        description.fr = '';
      }
    }
    
    res.json({
      id: publication.id,
      title,
      description,
      image: imageUrl,
      updatedAt: publication.updatedAt,
      firstName: publication.firstName,
      lastName: publication.lastName,
      userId: publication.userId,
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

    if (!title || !title.fr) {
      return res.status(400).json({ error: 'Le titre en français est requis' });
    }

    // Parser les données JSON reçues depuis FormData
    let parsedTitle, parsedDescription;
    try {
      parsedTitle = typeof title === 'string' ? JSON.parse(title) : title;
      parsedDescription = description ? (typeof description === 'string' ? JSON.parse(description) : description) : null;
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(400).json({ error: 'Données JSON invalides' });
    }

    let updateQuery = 'UPDATE splash_publication SET title = ?, description = ?, updatedAt = NOW()';
    let params = [JSON.stringify(parsedTitle), parsedDescription ? JSON.stringify(parsedDescription) : null];

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