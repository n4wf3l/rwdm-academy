# 🔧 Correction CORS et Cookies - Résumé Complet

## 📄 Fichier server.js corrigé

Votre fichier `server.js` a été entièrement corrigé. Les principales modifications sont :

### 🎯 Changements principaux

#### 1. Configuration CORS dynamique
```javascript
// Configuration CORS et environnement
const allowedOrigins = [
  "https://rwdmacademy.be",
  "https://daringbrusselsacademy.be"
];
const isLocal = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin || "");
const isProd = process.env.NODE_ENV === "production";

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Permettre les requêtes sans origin (ex: Postman)
    if (isProd) {
      return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"));
    }
    return isLocal(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Gérer explicitement les requêtes preflight OPTIONS
app.options("*", cors());
```

#### 2. Cookies JWT adaptés à l'environnement
```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  // domain: isProd ? "rwdmacademy.be" : undefined, // Optionnel
});
```

#### 3. Socket.IO CORS corrigé
```javascript
const io = new Server(server, {
  cors: {
    origin: isProd 
      ? allowedOrigins 
      : [/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i],
    credentials: true,
    methods: ["GET", "POST"],
  },
});
```

#### 4. Trust proxy en production
```javascript
// Trust proxy en production pour les cookies sécurisés
if (isProd) {
  app.set("trust proxy", 1);
}
```

## 📋 Checklist des problèmes résolus

- ✅ **CORS Origin fixe** : Remplacé `http://localhost:3000` par logique dynamique
- ✅ **Ports flexibles en dev** : Autorise localhost:5174, localhost:5173, localhost:3000, etc.
- ✅ **Credentials manquants** : Ajouté `credentials: true` partout
- ✅ **SameSite incorrect** : `"Strict"` → `"Lax"` en dev, `"None"` en prod
- ✅ **Secure cookies** : Adapté selon l'environnement (false en dev, true en prod)
- ✅ **Preflight OPTIONS** : Gestion explicite avec `app.options("*", cors())`
- ✅ **Socket.IO CORS** : Aligné avec la configuration Express
- ✅ **Trust proxy** : Configuré pour la production derrière proxy

## 🔧 Variables d'environnement

**En développement (.env local) :**
```bash
NODE_ENV=development
```

**En production (.env prod) :**
```bash
NODE_ENV=production
```

## 🧪 Tests de validation CORS

### Tests en développement (votre frontend sur :5174)

**Preflight test :**
```bash
curl -i -X OPTIONS http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET"
```

**GET test :**
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5174" \
  -H "Cookie: token=FAKE"
```

**Test autre port local (doit fonctionner) :**
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://localhost:5173"
```

**Test origine externe (doit échouer) :**
```bash
curl -i http://localhost:5000/api/settings \
  -H "Origin: http://evil.test"
```

### Résultats attendus

**Succès (localhost) :**
```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Échec (externe) :**
```
HTTP/1.1 500 Internal Server Error
(pas d'en-têtes CORS)
```

## 📊 Diff unifié (patch)

Le fichier `server_diff.patch` contient tous les changements. Voici les modifications clés :

```diff
+// Configuration CORS et environnement
+const allowedOrigins = [
+  "https://rwdmacademy.be",
+  "https://daringbrusselsacademy.be"
+];
+const isLocal = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin || "");
+const isProd = process.env.NODE_ENV === "production";

-    origin:
-      process.env.NODE_ENV === "production"
-        ? "https://daringbrusselsacademy.be"
-        : "http://localhost:3000",
+    origin(origin, cb) {
+      if (!origin) return cb(null, true);
+      if (isProd) {
+        return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"));
+      }
+      return isLocal(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"));
+    },

-        secure: process.env.NODE_ENV === "production",
-        sameSite: "Strict",
+        secure: isProd,
+        sameSite: isProd ? "None" : "Lax",
```

## ✅ Vérification du bon fonctionnement

1. **Démarrez votre backend :** `npm start` (ou `node server.js`)
2. **Démarrez votre frontend Vite :** `npm run dev` (sur :5174)
3. **Testez la connexion :** Votre frontend doit pouvoir se connecter sans erreur CORS
4. **Vérifiez les cookies :** Ils doivent être définis avec les bons paramètres
5. **Testez Socket.IO :** La connexion WebSocket doit fonctionner

## 🚨 Points d'attention

- **En production** : Assurez-vous que `NODE_ENV=production` est défini
- **Domaines** : Vérifiez que votre domaine prod est bien dans `allowedOrigins`
- **HTTPS** : En production, tous les domaines doivent être en HTTPS pour `sameSite: "None"`
- **Proxy** : Le `trust proxy` permet aux cookies sécurisés de fonctionner derrière un reverse proxy

La configuration est maintenant robuste et s'adapte automatiquement selon l'environnement ! 🎉