# RWDM Academy – Plateforme de Gestion Administrative

## 📅 Période de développement
**Du 10 mars 2025 au 31 mai 2025**

## 🎯 Objectif
Faciliter la gestion et l'administration de la RWDM Academy en dématérialisant les processus liés aux inscriptions, tests de sélection, déclarations d’accidents, certificats de guérison et décharges de responsabilité. Cette plateforme permet de gagner un temps précieux tout en structurant les processus de l'académie.

---

## 🧩 Fonctionnalités principales

### 🔧 Côté Administrateur
- **Tableau de bord interactif**
- **Planning global**
- **Système d'archivage** des documents terminés
- **Calculateur d'espace libre de la base de données** (aide à planifier les archivages)
- **Gestion des emails (19 modèles)** : création, modification, suppression (CRUD)
- **Gestion des membres** :
  - Suppression logique (soft delete)
  - Suppression définitive
- **Authentification par rôles** :
  - `admin`, `superadmin`, `owner`
- **Paramètres personnalisables** :
  - Textes dynamiques
  - Horaires d’ouverture
  - Logos
  - Images affichées côté client
- **Toggle de formulaires** :
  - Activation/désactivation d’un formulaire précis avec message personnalisé
- **Modification des PDF clients** : transmission à un médecin (déclaration d’accident)
- **WebSocket intégré** :
  - Notifications *toast* en temps réel lors de nouvelles demandes

### 👤 Rôle Owner (Accès avancé)
- **Page personnalisée** connectée à l’API *Pro Soccer Data* :
  - Données de facturation des joueurs
  - Graphiques, statistiques, filtres
  - Impression, export PDF et Excel
- **Vue hiérarchique pyramidale** :
  - Catégories, équipes, joueurs
  - Détail des noms/prénoms par clic

### 🎓 Guide d'utilisation
- Présent sur chaque page
- Tutoriels vidéo avec voix off IA
- Adaptés à chaque rôle : `guest`, `admin`, `superadmin`, `owner`

---

## 🧑‍💻 UI/UX Design
- **Responsive Design** :
  - Bureau, tablette, mobile
- **Style fidèle au club** :
  - Noir, Rouge, Blanc
  - Slogan affiché dans chaque footer
- **Formulaires dynamiques** :
  - Blocage de dates invalides en temps réel (via *toast*)
- **Multilingue complet** :
  - Français, Néerlandais, Anglais
  - Choix de langue au premier accès (stockée en `localStorage`)
  - Possibilité de changer de langue à tout moment via le menu

---

## 🔐 Sécurité

### Formulaires
- **Minuteur de 10 minutes** après un envoi (stocké en `localStorage`)
- **Blocage de double envoi**
- **Formulaire de contact** avec :
  - Minuteur
  - reCAPTCHA intégré

### Authentification
- **Connexion sécurisée avec reCAPTCHA**
- **Mot de passe requis + validation**
- **Token de session unique** généré à chaque connexion
- **Réinitialisation de mot de passe** par email
- **Mots de passe hashés** dans la base de données

---

## 📦 Développement & Méthodologie

- **Méthodologie Agile** :
  - Utilisation de **Trello**
  - Organisation en **User Stories**, **Sprints**, **Backlogs**
  - Méthode **KANBAN**

- **Données de test** :
  - Base de données disponible avec **seeders**

- **Déploiement** :
  - Hébergement chez **Hostinger**
  - **HTTPS** activé
  - Conforme **RGPD** et conditions légales

- **Pages légales incluses** :
  - Politique de confidentialité
  - Conditions générales d'utilisation (CGU)
  - Mentions légales
  - Politique Cookies (non utilisés, mais mentionnés)

---

## 📬 Accès
Plateforme disponible sur demande.

---

## 📎 À propos
Développée pour le club RWDM afin d'améliorer la gestion des flux administratifs et optimiser les interactions avec les membres, tout en respectant les normes modernes de sécurité, d’ergonomie et de protection des données.

---



