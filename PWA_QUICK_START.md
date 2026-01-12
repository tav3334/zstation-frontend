# 🚀 PWA Quick Start - Z-STATION

## Étapes Rapides pour Activer la PWA

### 1️⃣ Générer les Icônes (2 minutes)

1. Ouvrez [generate-icons.html](generate-icons.html) dans votre navigateur
2. Téléchargez toutes les icônes (8 fichiers)
3. Placez-les dans le dossier `public/`

**Icônes requises :**
```
public/
  ├── icon-72x72.png
  ├── icon-96x96.png
  ├── icon-128x128.png
  ├── icon-144x144.png
  ├── icon-152x152.png
  ├── icon-192x192.png
  ├── icon-384x384.png
  └── icon-512x512.png
```

### 2️⃣ Build et Test (1 minute)

```bash
# Build l'application
npm run build

# Démarrer en dev pour tester
npm run dev
```

### 3️⃣ Vérifier dans Chrome (30 secondes)

1. Ouvrez `http://localhost:5173`
2. F12 > Application > Manifest
3. Vérifiez que tout est vert ✅

### 4️⃣ Installer sur Desktop

- Cherchez l'icône ➕ dans la barre d'adresse Chrome
- Cliquez sur "Installer"

### 5️⃣ Tester sur Mobile

**Android :**
1. Ouvrez Chrome sur mobile
2. Allez à `http://VOTRE_IP:5173` (trouvez IP avec `ipconfig`)
3. Cliquez sur "Ajouter à l'écran d'accueil"

**iOS :**
1. Ouvrez Safari (pas Chrome)
2. Allez à `http://VOTRE_IP:5173`
3. Partager > Sur l'écran d'accueil

---

## ✅ Fichiers PWA Créés

- `public/manifest.json` - Configuration PWA
- `public/sw.js` - Service Worker
- `public/register-sw.js` - Enregistrement SW
- `index.html` - Mis à jour avec les liens PWA
- `generate-icons.html` - Générateur d'icônes

---

## 📖 Documentation Complète

Consultez [PWA_GUIDE.md](PWA_GUIDE.md) pour :
- Guide détaillé d'installation
- Troubleshooting
- Personnalisation avancée
- Déploiement en production

---

## 🎯 Prochaines Étapes

1. ✅ Générer les icônes
2. ✅ Tester localement
3. 🔄 Déployer en production (Vercel/Netlify)
4. 🔄 Tester installation depuis l'URL de production

**Note** : La PWA nécessite HTTPS en production (gratuit avec Vercel/Netlify)
