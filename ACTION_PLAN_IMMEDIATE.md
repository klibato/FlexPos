# 🚨 PLAN D'ACTION IMMÉDIAT - CORRECTIONS CRITIQUES FLEXPOS

**Date :** 2 décembre 2025
**Priorité :** P0 - BLOQUEURS PRODUCTION
**Délai :** 3 jours
**Budget :** 1 800€ HT

---

## ⚡ QUICK FIXES - COPIER-COLLER

### 🔴 FIX 1 : CVE-FLEXPOS-006 - Cross-Tenant Data Breach (30 min)

**Fichier :** `/backend/src/middlewares/tenantIsolation.js`

**Ligne 40-54 - AVANT :**
```javascript
else if (req.headers['x-organization-id']) {
  organizationId = parseInt(req.headers['x-organization-id'], 10);
  logger.debug(`Tenant detection: From header X-Organization-ID (org_id=${organizationId})`);
}
```

**APRÈS (remplacer par) :**
```javascript
else if (req.headers['x-organization-id']) {
  // ✅ FIX CVE-FLEXPOS-006: Autoriser uniquement super-admins
  if (!req.admin || req.admin.role !== 'super_admin') {
    logger.warn(`Unauthorized X-Organization-ID attempt from user ${req.user?.id || 'unknown'}`);
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'X-Organization-ID header is restricted to super-admins only'
      }
    });
  }
  organizationId = parseInt(req.headers['x-organization-id'], 10);
  logger.warn(`Super-admin ${req.admin.id} accessing organization ${organizationId} (audit logged)`);

  // Créer audit log pour traçabilité RGPD
  if (req.admin) {
    const AuditLog = require('../models/AuditLog');
    AuditLog.create({
      user_id: req.admin.id,
      action: 'CROSS_TENANT_ACCESS',
      entity_type: 'organization',
      entity_id: organizationId,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      details: { original_org: req.user?.organization_id, target_org: organizationId }
    }).catch(err => logger.error('Failed to log cross-tenant access:', err));
  }
}
```

**Test :**
```bash
# Doit retourner 403 Forbidden
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <TOKEN_USER_NORMAL>" \
  -H "X-Organization-ID: 999"
```

---

### 🔴 FIX 2 : Appliquer tenantIsolation sur TOUTES les routes (2h)

**Fichiers à modifier :** Tous les `/backend/src/routes/*.js`

**Ajouter en HAUT de chaque fichier (après les requires, avant les routes) :**

```javascript
const tenantIsolation = require('../middlewares/tenantIsolation');

// ✅ FIX: Forcer isolation multi-tenant sur toutes les routes
router.use(tenantIsolation);
```

**Liste complète des fichiers (14) :**
- ✅ `/backend/src/routes/auth.js`
- ✅ `/backend/src/routes/users.js`
- ✅ `/backend/src/routes/products.js`
- ✅ `/backend/src/routes/sales.js`
- ✅ `/backend/src/routes/cashRegisters.js`
- ✅ `/backend/src/routes/dashboard.js`
- ✅ `/backend/src/routes/settings.js`
- ✅ `/backend/src/routes/logs.js`
- ✅ `/backend/src/routes/printer.js`
- ✅ `/backend/src/routes/nf525.js`
- ✅ `/backend/src/routes/dailyReports.js`
- ✅ `/backend/src/routes/organizations.js`
- ✅ `/backend/src/routes/admin.js`
- ⚠️ `/backend/src/routes/public.js` (laisser sans tenantIsolation - routes publiques)

**Exemple complet - products.js :**
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requirePermission, optionalAuthenticate } = require('../middlewares/auth');
const { uploadSingleImage } = require('../middlewares/uploadMiddleware');
const tenantIsolation = require('../middlewares/tenantIsolation'); // ← AJOUTER

// ✅ FIX CVE-FLEXPOS-007: Forcer isolation multi-tenant
router.use(tenantIsolation); // ← AJOUTER CETTE LIGNE

// Routes products
router.get('/', optionalAuthenticate, productController.getAllProducts);
// ... reste du code
```

---

### 🔴 FIX 3 : Créer séquence ticket_number (30 min)

**Fichier :** Créer `/database/migrations/031_create_ticket_number_sequence.sql`

```sql
-- Migration 031: Créer séquence ticket_number
-- Date: 2025-12-03
-- Description: Fix erreur PostgreSQL lors création ventes (NF525)
-- Auteur: Audit FlexPOS 2025-12-02

DO $$
BEGIN
  -- Créer séquence si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_sequences
    WHERE schemaname = 'public'
    AND sequencename = 'ticket_number_seq'
  ) THEN
    CREATE SEQUENCE ticket_number_seq START WITH 1;
    RAISE NOTICE 'Migration 031: Séquence ticket_number_seq créée avec succès';
  ELSE
    RAISE NOTICE 'Migration 031: Séquence ticket_number_seq existe déjà (skip)';
  END IF;
END $$;

-- Commenter pour la documentation
COMMENT ON SEQUENCE ticket_number_seq IS 'Séquence pour numérotation continue des tickets de caisse (conformité NF525 - Décret n°2016-1551)';

-- Vérification
DO $$
DECLARE
  next_val BIGINT;
BEGIN
  SELECT nextval('ticket_number_seq') INTO next_val;
  RAISE NOTICE 'Migration 031: Test séquence OK - Prochaine valeur: %', next_val;
  -- Rollback du test
  PERFORM setval('ticket_number_seq', currval('ticket_number_seq') - 1);
END $$;
```

**Exécuter migration :**
```bash
cd backend
psql -d pos_burger -U postgres -f ../database/migrations/031_create_ticket_number_sequence.sql
```

**OU via Node.js :**
```javascript
// backend/src/scripts/runMigration.js
const { sequelize } = require('../models');
const fs = require('fs');

async function runMigration() {
  const sql = fs.readFileSync('../database/migrations/031_create_ticket_number_sequence.sql', 'utf8');
  await sequelize.query(sql);
  console.log('✅ Migration 031 exécutée avec succès');
}

runMigration();
```

**Test :**
```bash
# Doit réussir (créer une vente)
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":1,"unit_price_ttc":10}],"payment_method":"cash","amount_paid":10}'
```

---

### 🔴 FIX 4 : Calculer vat_breakdown dans Rapport Z (2h)

**Fichier :** `/backend/src/models/DailyReport.js`

**Ligne 351 - AVANT :**
```javascript
vat_breakdown: {},
```

**APRÈS (remplacer par) :**
```javascript
vat_breakdown: await DailyReport.calculateVATBreakdown(
  organizationId,
  reportDate,
  transaction
),
```

**Ajouter méthode statique APRÈS la fonction generateForDate (ligne ~365) :**
```javascript
/**
 * Calcule la ventilation TVA pour un rapport journalier
 * @param {number} organizationId - ID de l'organisation
 * @param {string} reportDate - Date du rapport (YYYY-MM-DD)
 * @param {Transaction} transaction - Transaction Sequelize
 * @returns {Object} Ventilation TVA par taux
 */
static async calculateVATBreakdown(organizationId, reportDate, transaction) {
  const { Op } = require('sequelize');
  const Sale = require('./Sale');

  // Récupérer toutes les ventes de la journée
  const startDate = new Date(reportDate + ' 00:00:00');
  const endDate = new Date(reportDate + ' 23:59:59');

  const sales = await Sale.findAll({
    where: {
      organization_id: organizationId,
      created_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    attributes: ['vat_details'],
    transaction,
  });

  // Agréger par taux de TVA
  const breakdown = {};

  sales.forEach((sale) => {
    if (sale.vat_details && typeof sale.vat_details === 'object') {
      Object.entries(sale.vat_details).forEach(([rate, details]) => {
        const rateKey = parseFloat(rate).toFixed(2); // Normaliser (ex: "20.00")

        if (!breakdown[rateKey]) {
          breakdown[rateKey] = {
            base_ht: 0,
            amount_vat: 0,
            total_ttc: 0,
          };
        }

        breakdown[rateKey].base_ht += parseFloat(details.base_ht || 0);
        breakdown[rateKey].amount_vat += parseFloat(details.amount_vat || 0);
        breakdown[rateKey].total_ttc += parseFloat(details.total_ttc || 0);
      });
    }
  });

  // Arrondir à 2 décimales (conformité comptable)
  Object.keys(breakdown).forEach((rate) => {
    breakdown[rate].base_ht = parseFloat(breakdown[rate].base_ht.toFixed(2));
    breakdown[rate].amount_vat = parseFloat(breakdown[rate].amount_vat.toFixed(2));
    breakdown[rate].total_ttc = parseFloat(breakdown[rate].total_ttc.toFixed(2));
  });

  return breakdown;
}
```

**Test :**
```bash
# Générer rapport Z
curl -X POST http://localhost:3000/api/daily-reports/generate \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"report_date":"2025-12-02"}'

# Vérifier vat_breakdown dans la réponse
# Doit contenir : { "20.00": { base_ht: ..., amount_vat: ..., total_ttc: ... }, ... }
```

---

### 🔴 FIX 5 : Corriger bug cookies config.env (5 min)

**Fichier :** `/backend/src/config/env.js`

**Ligne 20 - AVANT :**
```javascript
module.exports = {
  NODE_ENV,
  PORT: PORT || 3000,
  // ...
};
```

**APRÈS (ajouter ligne 2) :**
```javascript
module.exports = {
  NODE_ENV,
  env: NODE_ENV, // ✅ FIX CVE-FLEXPOS-002: Ajouter pour cookies sécurisés
  PORT: PORT || 3000,
  // ... reste du code
};
```

**Test :**
```javascript
// Dans backend, exécuter :
const config = require('./src/config/env');
console.log('NODE_ENV:', config.NODE_ENV);
console.log('env:', config.env); // Doit afficher la même valeur
console.log('Cookies secure:', config.env === 'production'); // true en prod
```

---

### 🔴 FIX 6 : Supprimer logging credentials (30 min)

**Fichiers à modifier (6) :**

#### 1. `/backend/src/services/seedAll.js` - Lignes 92, 95
```javascript
// AVANT:
logger.info('  - Username: manager');
logger.info('  - PIN: 789456'); // ❌

// APRÈS:
logger.info('  - Username: manager');
logger.info('  - PIN: [REDACTED]'); // ✅
```

#### 2. `/backend/src/services/seedUsers.js` - Lignes 37, 40
```javascript
// AVANT:
logger.info('  - PIN: 789456'); // ❌

// APRÈS:
logger.info('  - PIN: [REDACTED]'); // ✅
```

#### 3. `/backend/src/controllers/authController.js` - Ligne 680
```javascript
// AVANT:
logger.info(`RGPD: User data deleted for user ${userId} (email: ${user.email})`); // ❌

// APRÈS:
logger.info(`RGPD: User data deleted for user ID ${userId}`); // ✅
```

#### 4. `/backend/src/controllers/admin/adminAuthController.js` - Ligne 180
```javascript
// AVANT:
logger.info(`Password reset requested for admin: ${email}`); // ❌

// APRÈS:
logger.info(`Password reset requested for admin ID: ${adminUser.id}`); // ✅
```

#### 5. Rechercher TOUS les autres logs sensibles
```bash
# Vérifier qu'il n'y a plus d'emails/passwords dans les logs
grep -r "logger.*email\|logger.*password\|logger.*pin" backend/src --include="*.js"

# Ne doit retourner que des commentaires ou [REDACTED]
```

#### 6. Nettoyer les logs existants (PRODUCTION)
```bash
# Si logs déjà générés avec données sensibles :
cd backend
rm -f logs/combined.log logs/error.log
echo "Logs nettoyés - redémarrer l'application"
```

**Test :**
```bash
# Après fix, vérifier qu'aucun email n'apparaît dans les nouveaux logs
tail -f backend/logs/combined.log | grep -i "email\|password\|pin"
# Ne doit rien afficher (sauf [REDACTED])
```

---

## ✅ CHECKLIST D'EXÉCUTION

### Jour 1 (Matin)
- [ ] **FIX 1** : CVE-006 Cross-tenant (30 min)
- [ ] **FIX 2** : tenantIsolation sur routes (2h)
- [ ] **FIX 5** : Bug cookies config.env (5 min)
- [ ] Tests FIX 1-2-5 (1h)

### Jour 1 (Après-midi)
- [ ] **FIX 3** : Séquence ticket_number (30 min)
- [ ] **FIX 4** : vat_breakdown Rapport Z (2h)
- [ ] Tests FIX 3-4 (1h)

### Jour 2 (Matin)
- [ ] **FIX 6** : Supprimer logging credentials (30 min)
- [ ] Nettoyer logs existants (15 min)
- [ ] Tests complets E2E (2h)

### Jour 2 (Après-midi)
- [ ] Tests multi-tenant (injection X-Org-ID) (1h)
- [ ] Tests NF525 (création vente + rapport Z) (1h)
- [ ] Code review complet (1h)

### Jour 3
- [ ] Tests de charge (100 ventes simultanées) (2h)
- [ ] Tests sécurité (scan OWASP ZAP) (2h)
- [ ] Documentation des fixes (1h)
- [ ] Déploiement staging (1h)

---

## 🧪 TESTS DE VALIDATION

### Test 1 : CVE-006 Cross-tenant (CRITIQUE)

**Scénario :** User normal tente d'accéder à autre organisation

```bash
# 1. Login user tenant 1
TOKEN1=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","pin_code":"1234"}' | jq -r '.token')

# 2. Tenter accès tenant 2 avec header X-Organization-ID
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN1" \
  -H "X-Organization-ID: 2"

# ATTENDU: 403 Forbidden {"error":{"code":"FORBIDDEN",...}}
# SI RETOURNE 200 + produits tenant 2 → ÉCHEC !
```

### Test 2 : Création vente (BLOQUANT)

```bash
# Doit réussir après fix séquence ticket_number
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product_id":1,"quantity":2,"unit_price_ttc":15.50}],
    "payment_method": "cash",
    "amount_paid": 31.00
  }'

# ATTENDU: 201 Created avec ticket_number généré
# SI ERROR: relation "ticket_number_seq" does not exist → ÉCHEC !
```

### Test 3 : Rapport Z avec VAT breakdown (BLOQUANT NF525)

```bash
# Générer rapport Z du jour
curl -X POST http://localhost:3000/api/daily-reports/generate \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"report_date":"2025-12-02"}'

# ATTENDU: vat_breakdown contient détail par taux
# Exemple: {"20.00":{"base_ht":100,"amount_vat":20,"total_ttc":120}}
# SI vat_breakdown: {} (vide) → ÉCHEC !
```

### Test 4 : Cookies sécurisés en production

```bash
# En environnement production
export NODE_ENV=production

# Relancer serveur et vérifier cookies
curl -i http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","pin_code":"1234"}'

# ATTENDU dans headers: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
# SI manque "Secure" → ÉCHEC !
```

### Test 5 : Logs sans credentials

```bash
# Créer un user + login + suppression
# Vérifier logs
tail -100 backend/logs/combined.log | grep -i "email\|password\|pin"

# ATTENDU: 0 résultats (ou seulement [REDACTED])
# SI emails/PINs visibles → ÉCHEC !
```

---

## 📊 MÉTRIQUES DE SUCCÈS

| Métrique | Avant | Objectif | Validation |
|----------|-------|----------|------------|
| Score sécurité | 6.2/10 | 8.5/10 | ✅ |
| Score NF525 | 7/12 (58%) | 10/12 (83%) | ✅ |
| Score RGPD | 7.5/13 (58%) | 10/13 (77%) | ✅ |
| CVE critiques | 6 | 0 | ✅ |
| Tests multi-tenant | 0 | 5 passés | ✅ |
| Ventes créables | ❌ | ✅ | ✅ |

---

## 🚀 APRÈS P0 (IMMÉDIAT)

### Semaine suivante (P1 - URGENT)
1. PIN 6 chiffres minimum
2. CSRF protection (csurf)
3. Rate limiting password reset
4. Chiffrer secrets 2FA (AES-256)
5. Validation magic bytes uploads
6. Refresh tokens JWT

**Budget P1 :** 3 000€ HT

### Certification NF525
Une fois P0 + P1 corrigés :
- Contacter AFNOR Certification : https://certification.afnor.org/
- Dossier à fournir : Code source + tests + documentation
- Délai : 2-4 semaines
- Coût : ~1 500€

---

## 📞 SUPPORT

**Questions sur ce plan :** Voir `AUDIT_SAAS_COMPLET_2025-12-02.md` sections détaillées

**Blocage technique :** Vérifier logs dans `backend/logs/error.log`

**Tests échoués :** Relancer avec `NODE_ENV=test npm test` pour détails

---

**Version :** 1.0
**Date :** 2 décembre 2025
**Dernière mise à jour :** Audit exhaustif FlexPOS
**Auteur :** Claude Code - Audit Technique Senior

✅ **READY TO EXECUTE** - Tous les fixes sont prêts à copier-coller !
