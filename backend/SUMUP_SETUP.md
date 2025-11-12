# Configuration SumUp pour BensBurger POS

## Vue d'ensemble

L'intégration SumUp permet d'accepter les paiements par carte bancaire via l'API SumUp ou un terminal physique SumUp (Air/Solo).

## Prérequis

1. **Compte marchand SumUp**
   - Créer un compte sur https://sumup.com/
   - Valider le compte marchand

2. **Clés API**
   - Se connecter au dashboard SumUp
   - Accéder à Developer > API Keys
   - Générer une clé API (OAuth token)

## Configuration

### Variables d'environnement

Ajouter les variables suivantes dans le fichier `.env` du backend:

```env
# SumUp Configuration
SUMUP_ENABLED=true
SUMUP_API_KEY=your_sumup_api_key_here
SUMUP_MERCHANT_CODE=your_merchant_code_here
SUMUP_MERCHANT_EMAIL=your@email.com
SUMUP_API_URL=https://api.sumup.com/v0.1
```

### Obtenir les informations SumUp

#### 1. API Key
- Dashboard SumUp > Developer > API Keys
- Créer une nouvelle clé API
- Copier le token OAuth généré

#### 2. Merchant Code
- Dashboard SumUp > Account > Business Profile
- Le merchant code est affiché dans les informations du compte

## Utilisation

### API Endpoints

#### Vérifier le statut de SumUp
```bash
GET /api/sumup/status
Authorization: Bearer <jwt_token>
```

Réponse:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "configured": true,
    "connected": true,
    "message": "SumUp opérationnel"
  }
}
```

#### Créer un checkout
```bash
POST /api/sumup/checkout
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 15.50,
  "reference": "20250112-0001",
  "description": "BensBurger - Ticket 20250112-0001"
}
```

Réponse:
```json
{
  "success": true,
  "data": {
    "checkout_id": "abc123...",
    "status": "PENDING",
    "amount": 15.50
  }
}
```

#### Traiter un paiement
```bash
POST /api/sumup/process
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 15.50,
  "reference": "20250112-0001"
}
```

Réponse:
```json
{
  "success": true,
  "data": {
    "checkout_id": "abc123...",
    "transaction_id": "abc123...",
    "amount": 15.50,
    "status": "PAID",
    "message": "Paiement SumUp accepté"
  }
}
```

## Intégration avec le POS

### Mode de fonctionnement

Le système BensBurger POS supporte deux modes d'intégration SumUp:

#### 1. Mode API (MVP)
- Création de checkout via l'API REST SumUp
- Simulation de paiement pour le développement
- Utile pour les tests et le MVP

#### 2. Mode Terminal (Production)
- Intégration avec terminal physique SumUp Air ou Solo
- Nécessite le SDK SumUp pour la communication avec le terminal
- Communication via Bluetooth ou USB

### Workflow de paiement

1. Le caissier sélectionne "Carte bancaire" comme mode de paiement
2. Si SumUp est configuré, le système crée un checkout via l'API
3. Le terminal SumUp (physique) affiche le montant à payer
4. Le client présente sa carte au terminal
5. Le terminal traite le paiement et confirme
6. Le POS enregistre la vente et imprime le ticket

## Tests

### Mode développement

En développement, SumUp peut fonctionner en mode simulation:
- Les paiements sont acceptés automatiquement après 2 secondes
- Aucun vrai paiement n'est effectué
- Utile pour tester le flux sans terminal physique

### Mode production

En production avec un vrai compte SumUp:
- Utiliser l'environnement de test SumUp (sandbox)
- Utiliser des cartes de test fournies par SumUp
- Vérifier les transactions dans le dashboard SumUp

## Dépannage

### SumUp non opérationnel

Si le statut SumUp indique "non opérationnel":

1. **Vérifier les variables d'environnement**
   - `SUMUP_ENABLED=true`
   - `SUMUP_API_KEY` présent et valide
   - `SUMUP_MERCHANT_CODE` correct

2. **Vérifier la connexion API**
   - Tester la connexion manuellement:
     ```bash
     curl -H "Authorization: Bearer YOUR_API_KEY" \
       https://api.sumup.com/v0.1/me
     ```

3. **Vérifier les logs**
   - Consulter les logs du backend
   - Rechercher les erreurs SumUp
   - Vérifier la connexion internet

### Erreurs courantes

#### "SUMUP_API_KEY manquant"
- Ajouter `SUMUP_API_KEY` dans le fichier `.env`
- Redémarrer le serveur backend

#### "Merchant not found"
- Vérifier le `SUMUP_MERCHANT_CODE`
- S'assurer que le compte marchand est actif

#### "Payment failed"
- Vérifier que le terminal SumUp est allumé et connecté
- Vérifier le solde de la carte de test
- Consulter les logs SumUp dans le dashboard

## Sécurité

### Bonnes pratiques

1. **Ne jamais commiter les clés API**
   - Utiliser `.env` (déjà dans `.gitignore`)
   - Utiliser des variables d'environnement en production

2. **Utiliser HTTPS en production**
   - Obligatoire pour la sécurité PCI-DSS
   - Les cartes bancaires sont des données sensibles

3. **Limiter les accès à l'API**
   - L'API Key a des permissions limitées
   - Révoquer les clés compromises immédiatement

4. **Audit logs**
   - Tous les paiements sont loggés
   - Conserver les logs pour audit

## Support

- Documentation SumUp: https://developer.sumup.com/docs/
- Support SumUp: https://sumup.com/support
- FAQ SumUp: https://developer.sumup.com/docs/faq

## Roadmap

### Fonctionnalités futures

- [ ] Intégration SDK SumUp pour terminal physique
- [ ] Gestion des remboursements via API
- [ ] Webhooks pour notifications temps réel
- [ ] Support multi-terminaux
- [ ] Statistiques avancées dans le dashboard
