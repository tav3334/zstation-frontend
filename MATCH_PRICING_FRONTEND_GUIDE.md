# Guide Frontend: Tarification par Match FIFA/PES

## Modifications apportées

### 1. Nouveau composant: MatchCountModal

**Fichier:** `src/components/MatchCountModal.jsx`

Ce modal permet à l'agent de saisir le nombre de matchs joués à la fin d'une session FIFA/PES en mode "par match".

**Fonctionnalités:**
- Saisie du nombre de matchs (minimum 1)
- Calcul automatique du prix total (matchs × prix unitaire)
- Validation avant confirmation
- Design responsive

**Props:**
```jsx
{
  session: {
    id: number,
    game: { name: string },
    gamePricing: { price: number }
  },
  onConfirm: (matchCount: number) => void,
  onClose: () => void
}
```

### 2. Modifications: StartSessionModal

**Fichier:** `src/components/StartSessionModal.jsx`

**Changements:**
- Affichage intelligent des modes de tarification
- Icônes distinctives: ⚽ pour "Par Match", ⏱️ pour "Par Temps"
- Message d'info pour le mode "par match"

**Exemple d'affichage:**
```
⚽ Par Match (1 match) - 6 DH
⏱️ 6 min - 6 DH
⏱️ 30 min - 10 DH
⏱️ 60 min - 20 DH
```

### 3. Modifications: Dashboard

**Fichier:** `src/pages/Dashboard.jsx`

**Nouveaux états:**
```jsx
const [matchCountSession, setMatchCountSession] = useState(null);
```

**Nouvelle fonction: `stopSessionWithMatchCount`**
```jsx
const stopSessionWithMatchCount = async (matchCount) => {
  const res = await api.post(`/sessions/stop/${sessionId}`, {
    matches_played: matchCount
  });
  // ... gestion du paiement
}
```

**Modification de `stopSession`:**
- Vérifie d'abord le mode de tarification via `/sessions/status/{id}`
- Si mode = `per_match`: Affiche MatchCountModal
- Si mode = `fixed`: Arrête normalement

**Nouveau modal rendu:**
```jsx
{matchCountSession && (
  <MatchCountModal
    session={matchCountSession}
    onConfirm={stopSessionWithMatchCount}
    onClose={() => setMatchCountSession(null)}
  />
)}
```

## Workflow Utilisateur

### Scénario 1: Mode Par Match

1. **Démarrer une session:**
   - Agent sélectionne FIFA/PES
   - Agent choisit "⚽ Par Match (1 match) - 6 DH"
   - Session démarre sans timer auto-stop

2. **Pendant la session:**
   - Le chronomètre affiche le temps écoulé
   - PAS d'auto-stop (le client joue autant qu'il veut)

3. **Arrêter la session:**
   - Agent clique sur "Arrêter"
   - Modal "Nombre de Matchs Joués" s'affiche
   - Agent saisit le nombre (ex: 3)
   - Le prix est calculé: 3 × 6 DH = 18 DH
   - Agent confirme

4. **Paiement:**
   - Modal de paiement s'affiche avec le montant: 18 DH
   - Agent finalise le paiement

### Scénario 2: Mode Par Temps (FIFA/PES ou autres jeux)

1. **Démarrer une session:**
   - Agent sélectionne un jeu
   - Agent choisit "⏱️ 30 min - 10 DH"
   - Session démarre avec timer

2. **Pendant la session:**
   - Le chronomètre affiche le temps restant
   - Auto-stop quand le temps est écoulé

3. **Arrêter la session:**
   - Agent clique sur "Arrêter" (ou auto-stop)
   - Modal de paiement s'affiche directement
   - Prix forfaitaire: 10 DH

4. **Paiement:**
   - Agent finalise le paiement

## API Endpoints Utilisés

### GET /api/games
Retourne les jeux avec leurs modes de tarification:
```json
{
  "id": 1,
  "name": "FIFA 24",
  "pricings": [
    {
      "id": 10,
      "pricing_mode": {
        "code": "per_match",
        "label": "Par Match"
      },
      "matches_count": 1,
      "price": "6.00"
    },
    {
      "id": 11,
      "pricing_mode": {
        "code": "fixed",
        "label": "Prix Fixe"
      },
      "duration_minutes": 30,
      "price": "10.00"
    }
  ]
}
```

### GET /api/sessions/status/{id}
Retourne le statut de la session avec le mode de tarification:
```json
{
  "status": "active",
  "pricing_mode": "per_match",
  "price_per_match": "6.00 DH",
  "message": "Saisir le nombre de matchs joués à la fin"
}
```

### POST /api/sessions/stop/{id}

**Pour mode par match:**
```json
{
  "matches_played": 3
}
```

**Réponse:**
```json
{
  "price": 18.00,
  "matches_played": 3,
  "calculation": "3 match(s) × 6.00 DH = 18.00 DH"
}
```

**Pour mode par temps:**
```json
{}
```

**Réponse:**
```json
{
  "price": 10.00,
  "forfait": "30 min = 10.00 DH"
}
```

## Tests à effectuer

### Test 1: Session par match
1. Démarrer FIFA avec mode "Par Match"
2. Jouer quelques minutes
3. Arrêter et saisir 2 matchs
4. Vérifier: Prix = 12 DH

### Test 2: Session par temps (FIFA)
1. Démarrer FIFA avec mode "30 min"
2. Attendre quelques minutes
3. Arrêter
4. Vérifier: Prix = 10 DH (forfait)

### Test 3: Session par temps (autre jeu)
1. Démarrer Call of Duty avec "60 min"
2. Attendre quelques minutes
3. Arrêter
4. Vérifier: Prix = 20 DH (forfait)

### Test 4: Validation du formulaire
1. Démarrer FIFA par match
2. Arrêter
3. Essayer de confirmer sans nombre → Doit bloquer
4. Saisir 0 ou -1 → Doit bloquer
5. Saisir un nombre valide → Doit fonctionner

## Design et UX

### Indicateurs visuels

**Mode Par Match:**
- Icône: ⚽
- Couleur: Vert (#10b981)
- Message: "Vous devrez saisir le nombre de matchs joués à la fin"

**Mode Par Temps:**
- Icône: ⏱️
- Couleur: Bleu (#3b82f6)
- Timer avec compte à rebours

### Responsive Design

Tous les modals sont responsives:
- Desktop: 450px max-width
- Tablet: 100% width avec padding
- Mobile: Adaptation des tailles de police et spacing

## Fichiers modifiés

1. ✅ `src/components/MatchCountModal.jsx` (nouveau)
2. ✅ `src/components/StartSessionModal.jsx` (modifié)
3. ✅ `src/pages/Dashboard.jsx` (modifié)

## Notes importantes

- Le mode "par match" ne fait PAS d'auto-stop
- L'agent DOIT saisir manuellement le nombre de matchs
- Le calcul du prix est fait côté backend pour sécurité
- Les sessions par match ne sont PAS limitées dans le temps
- MachineCard affiche toujours le chronomètre (temps écoulé)

## Prochaines améliorations possibles

1. Ajouter un bouton "+1 match" pendant la session
2. Historique des matchs joués par session
3. Mode mixte: X matchs OU Y minutes (le premier atteint)
4. Statistiques par match (temps moyen par match, etc.)
