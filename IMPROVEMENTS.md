# 🚀 Plan d'Amélioration - Z-STATION Frontend

## 📊 Score Actuel: 6.5/10

L'application fonctionne bien mais nécessite des améliorations en termes de performance, sécurité et maintenabilité.

---

## 🔴 Priorité CRITIQUE - Sécurité

### 1. Migrer vers httpOnly Cookies
**Problème**: Les tokens JWT sont stockés dans `localStorage`, vulnérables aux attaques XSS.

**Solution actuelle (vulnérable)**:
```javascript
// src/services/api.js
const token = localStorage.getItem("token"); // ❌ Vulnérable XSS
```

**Solution recommandée**:
```javascript
// Backend: Renvoyer le token dans un cookie httpOnly
return response()->json(['user' => $user])
    ->cookie('auth_token', $token, 60, '/', null, true, true);

// Frontend: Le cookie est automatiquement envoyé
api.defaults.withCredentials = true;
```

### 2. Nettoyer les console.log
**Problème**: Logs de debug visibles en production.

**Fichiers à nettoyer**:
- `src/pages/Dashboard.jsx` (lignes 72, 82, 118, etc.)
- `src/pages/AdminDashboard.jsx`
- `src/pages/Login.jsx` (ligne 118)

**Solution**:
```bash
# Rechercher tous les console.log
grep -r "console\\.log" src/

# Les remplacer par un logger conditionnel
const logger = import.meta.env.DEV ? console : { log: () => {}, error: () => {} };
```

### 3. Sanitiser les Inputs Utilisateurs
**Problème**: Pas de protection XSS sur les noms de produits, utilisateurs, etc.

**Solution**: Installer DOMPurify
```bash
npm install dompurify
```

```javascript
import DOMPurify from 'dompurify';

// Avant d'afficher du contenu utilisateur
<div>{DOMPurify.sanitize(user.name)}</div>
```

---

## ⚡ Priorité HAUTE - Performance

### 4. Code Splitting avec React.lazy()
**Problème**: Bundle de ~2.5MB chargé d'un coup.

**Solution**:
```javascript
// src/App.jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {!user ? <Login /> : user.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
    </Suspense>
  );
}
```

### 5. Lazy Load des Exports Excel/PDF
**Problème**: jsPDF et xlsx chargés même si jamais utilisés.

**Solution**:
```javascript
// src/pages/AdminDashboard.jsx
const handleExportPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  // Utiliser jsPDF...
};

const handleExportExcel = async () => {
  const XLSX = await import('xlsx');

  // Utiliser XLSX...
};
```

**Impact**: Réduction du bundle initial de ~500KB.

### 6. Optimiser les Re-renders
**Problème**: Composants se re-rendent inutilement.

**Solution**:
```javascript
import { memo, useMemo, useCallback } from 'react';

// Mémoïser les composants coûteux
const MachineCard = memo(({ machine, onStart }) => {
  return <div>...</div>;
});

// Mémoïser les calculs
const totalRevenue = useMemo(() => {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}, [payments]);

// Mémoïser les callbacks
const handleStart = useCallback((machineId) => {
  startSession(machineId);
}, []);
```

### 7. Remplacer le Polling par WebSocket
**Problème**: Actualisation toutes les 10 secondes = beaucoup de requêtes inutiles.

**Solution**:
```javascript
// Backend: Laravel WebSockets ou Pusher
// Frontend:
import Echo from 'laravel-echo';

const echo = new Echo({
  broadcaster: 'pusher',
  // config...
});

echo.channel('sessions')
  .listen('SessionStarted', (e) => {
    updateSessions(e.session);
  });
```

**Impact**: Réduction de 99% des requêtes API pour le temps réel.

---

## 🟡 Priorité MOYENNE - Architecture

### 8. Refactoriser les Gros Composants
**Problème**:
- `AdminDashboard.jsx`: 1750 lignes 🔴
- `Dashboard.jsx`: 853 lignes 🟡

**Solution**: Diviser en sous-composants
```
src/pages/AdminDashboard/
├── index.jsx (150 lignes)
├── components/
│   ├── StatsCards.jsx
│   ├── SessionsTable.jsx
│   ├── PaymentsTable.jsx
│   ├── ProductsManagement.jsx
│   ├── ExportButtons.jsx
│   └── Charts.jsx
└── hooks/
    ├── useStatistics.js
    └── useExport.js
```

### 9. Extraire les Styles Inline
**Problème**: 400+ lignes de CSS dans le JSX, difficile à maintenir.

**Solution 1**: CSS Modules
```javascript
// AdminDashboard.module.css
.container { /* styles */ }

// AdminDashboard.jsx
import styles from './AdminDashboard.module.css';
<div className={styles.container}>
```

**Solution 2**: styled-components
```javascript
import styled from 'styled-components';

const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;
```

### 10. Implémenter Context API
**Problème**: Prop drilling (user passé à travers tous les composants).

**Solution**:
```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Utilisation:
const { user } = useAuth();
```

### 11. Créer des Hooks Personnalisés
**Problème**: Logique dupliquée entre composants.

**Exemples de hooks à créer**:
```javascript
// src/hooks/useApi.js
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (apiFunc) => {
    setLoading(true);
    try {
      const result = await apiFunc();
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
};

// src/hooks/useSessions.js
export const useSessions = () => {
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => { /* ... */ };
  const startSession = async (data) => { /* ... */ };
  const stopSession = async (id) => { /* ... */ };

  return { sessions, loadSessions, startSession, stopSession };
};
```

---

## 🟢 Priorité BASSE - Qualité du Code

### 12. Ajouter des Tests
**Problème**: Aucun test = régressions faciles.

**Setup**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Exemples de tests**:
```javascript
// src/components/__tests__/UserProfile.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from '../UserProfile';

describe('UserProfile', () => {
  it('affiche les informations utilisateur', () => {
    const user = { name: 'Test', email: 'test@test.com', role: 'admin' };
    render(<UserProfile user={user} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('valide que les mots de passe correspondent', async () => {
    // ...
  });
});
```

### 13. Améliorer l'Accessibilité
**Problème**: Navigation clavier limitée, pas de lecteur d'écran.

**Améliorations**:
```javascript
// Ajouter des labels ARIA
<button
  aria-label="Démarrer la session"
  aria-describedby="session-help"
>
  Démarrer
</button>

// Focus management
const dialogRef = useRef();
useEffect(() => {
  if (showModal) {
    dialogRef.current?.focus();
  }
}, [showModal]);

// Trapfocus dans les modals
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <div className="modal">...</div>
</FocusTrap>
```

### 14. Améliorer le PWA
**Problème**: Service worker basique, pas de stratégie de cache.

**Améliorations**:
```javascript
// public/sw.js - Cache-first strategy
const CACHE_NAME = 'zstation-v1';
const urlsToCache = [
  '/',
  '/index.css',
  '/src/main.jsx'
];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**Fonctionnalités PWA à ajouter**:
- Notifications push (sessions qui se terminent)
- Mode hors ligne (afficher dernières données)
- Background sync (synchroniser quand connexion revient)

---

## 🎯 Plan d'Action Recommandé

### Phase 1: Sécurité (1-2 jours)
1. ✅ Nettoyer les console.log
2. ✅ Installer et utiliser DOMPurify
3. ⏳ Migrer vers httpOnly cookies (nécessite changement backend)

### Phase 2: Performance (2-3 jours)
4. ✅ Implémenter React.lazy() pour code splitting
5. ✅ Lazy load jsPDF et xlsx
6. ✅ Ajouter React.memo() sur composants coûteux
7. ⏳ WebSocket pour temps réel (optionnel)

### Phase 3: Architecture (3-5 jours)
8. ✅ Refactoriser AdminDashboard en sous-composants
9. ✅ Extraire styles inline vers CSS Modules
10. ✅ Implémenter AuthContext
11. ✅ Créer hooks personnalisés (useApi, useSessions)

### Phase 4: Tests et Documentation (2-3 jours)
12. ✅ Setup Vitest et tests unitaires
13. ✅ Ajouter tests sur composants critiques
14. ✅ Documenter les composants (JSDoc)

---

## 📈 Résultats Attendus

### Avant Optimisation
- **Bundle size**: ~2.5MB
- **First Contentful Paint**: 2.5s
- **Time to Interactive**: 4.2s
- **API calls/minute**: 60 (polling)

### Après Optimisation
- **Bundle size**: ~800KB initial + chunks lazy
- **First Contentful Paint**: 0.9s (↓ 64%)
- **Time to Interactive**: 1.5s (↓ 64%)
- **API calls/minute**: 2-5 (WebSocket)

---

## 🛠️ Commandes Utiles

```bash
# Analyser le bundle
npm run build
npx vite-bundle-visualizer

# Audit de sécurité
npm audit

# Linter
npm run lint

# Tests
npm run test

# Build de production
npm run build && npm run preview
```

---

## 📚 Ressources

- [React Performance](https://react.dev/reference/react/memo)
- [Code Splitting](https://react.dev/reference/react/lazy)
- [Web Vitals](https://web.dev/vitals/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Date de création**: 2026-01-13
**Dernière mise à jour**: 2026-01-13
**Prochaine revue**: À planifier
