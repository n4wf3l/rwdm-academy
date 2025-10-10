# Correction CORS et Cookies - Backend Express + Socket.IO

## 📋 Checklist des changements effectués

### ✅ Configuration CORS Express
- **Remplacé** l'origine hardcodée `http://localhost:3000` par une logique dynamique
- **Ajouté** la fonction `isLocal()` pour détecter les origines locales en dev (localhost et 127.0.0.1 sur n'importe quel port)
- **Créé** une liste blanche `allowedOrigins` pour la production
- **Activé** `credentials: true` pour permettre l'envoi de cookies
- **Ajouté** gestion explicite des requêtes preflight avec `app.options("*", cors())`

### ✅ Configuration Socket.IO CORS
- **Corrigé** la configuration CORS de Socket.IO avec la même logique que Express
- **Ajouté** `credentials: true` pour Socket.IO
- **Utilisé** regex pattern pour autoriser tous les ports locaux en dev

### ✅ Configuration des cookies JWT
- **Adapté** `secure: isProd` (false en dev, true en prod)
- **Modifié** `sameSite: isProd ? "None" : "Lax"` pour permettre les requêtes cross-origin
- **Conservé** `httpOnly: true` pour la sécurité

### ✅ Configuration proxy
- **Ajouté** `app.set("trust proxy", 1)` en production pour les cookies sécurisés derrière un proxy

### ✅ Autres corrections
- **Corrigé** le message de démarrage du serveur pour afficher la bonne URL
- **Mis à jour** la liste des domaines autorisés (rwdmacademy.be)

## 🔧 Variables d'environnement requises

Créez ou mettez à jour votre fichier `.env` :

```bash
# Environnement
NODE_ENV=development  # ou "production" en prod

# Base de données (conservez vos valeurs existantes)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT Secret (conservez votre valeur existante)
JWT_SECRET=your_jwt_secret

# Email (conservez vos valeurs existantes)
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Frontend URL pour les emails (optionnel)
FRONTEND_URL=http://localhost:5174  # en dev
# FRONTEND_URL=https://rwdmacademy.be  # en prod

# reCAPTCHA (conservez votre valeur existante)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

## 🧪 Tests CORS avec curl

### Test 1: Preflight (OPTIONS) depuis localhost:5174
```bash
curl -i -X OPTIONS http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Réponse attendue :**
```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Test 2: GET avec Origin localhost:5174
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5174" \
  -H "Cookie: token=FAKE_TOKEN_FOR_TEST"
```

### Test 3: Test avec localhost:5173 (Vite par défaut)
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5173"
```

### Test 4: Test avec localhost:3000 (ancienne config)
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://localhost:3000"
```

### Test 5: Test avec origin non autorisée (doit échouer)
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://evil.test"
```

**Réponse attendue : erreur CORS**

### Test 6: Test sans Origin (doit fonctionner - Postman/direct)
```bash
curl -i http://localhost:5000/api/settings
```

## 🚀 Tests de production

En production, seules ces origines sont autorisées :
- `https://rwdmacademy.be`
- `https://daringbrusselsacademy.be`

Test de production (à adapter avec votre vraie URL) :
```bash
curl -i https://your-backend.com/api/settings \
  -H "Origin: https://rwdmacademy.be"
```

## 🔍 Vérification du bon fonctionnement

### Frontend (Vite dev sur :5174)
1. Vos requêtes API depuis `http://localhost:5174` vers `http://localhost:5000` doivent fonctionner
2. Les cookies doivent être correctement envoyés et reçus
3. Socket.IO doit se connecter sans erreur CORS

### Production
1. Les requêtes depuis `https://rwdmacademy.be` vers le backend doivent fonctionner
2. Les cookies sécurisés doivent être définis avec `Secure=true` et `SameSite=None`

## 🐛 Debugging

Si vous avez encore des problèmes :

1. **Vérifiez les logs du navigateur** pour les erreurs CORS
2. **Inspectez les headers** de réponse dans l'onglet Network
3. **Vérifiez la variable `NODE_ENV`** dans votre environnement
4. **Testez avec curl** pour isoler les problèmes côté serveur

### Logs utiles à ajouter temporairement :
```javascript
app.use((req, res, next) => {
  console.log(`🌐 Origin: ${req.headers.origin}, Method: ${req.method}, URL: ${req.url}`);
  next();
});
```

## 📝 Notes importantes

- **SameSite "Lax" en dev** : Fonctionne pour les requêtes XHR/fetch cross-origin
- **SameSite "None" en prod** : Obligatoire pour les cookies cross-domain avec HTTPS
- **Trust proxy** : Nécessaire en production pour que Express reconnaisse les vraies IP derrière le proxy
- **Regex pour dev** : `/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i` autorise tous les ports locaux

La configuration est maintenant robuste et s'adapte automatiquement selon l'environnement !