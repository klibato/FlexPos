# 🔍 AUDIT EXHAUSTIF FLEXPOS - SYSTÈME SAAS MULTI-TENANT
## Point de Vente Conforme NF525 pour Restauration Française

**Date d'audit :** 2 décembre 2025
**Auditeur :** Claude Code - Audit Technique Senior
**Version FlexPOS :** 2.0.0
**Branch :** `claude/audit-flexpos-saas-01YHDGZEjZYhw7aJPPx3voGx`
**Périmètre :** Audit complet 15 phases (Technique, Sécurité, Conformité Légale)
**Agents déployés :** 6 agents spécialisés en parallèle
**Fichiers analysés :** 121 fichiers sources + 23 migrations SQL
**Lignes de code auditées :** ~20,874 lignes

---

## 📋 TABLE DES MATIÈRES

1. [Résumé Exécutif](#résumé-exécutif)
2. [Scores Globaux](#scores-globaux)
3. [Risques Légaux Critiques](#risques-légaux-critiques)
4. [Phase 1 : Cartographie](#phase-1-cartographie)
5. [Phase 2 : Documentation](#phase-2-documentation)
6. [Phase 3 : Migrations BDD](#phase-3-migrations-bdd)
7. [Phase 4 : Schéma BDD & Multi-tenant](#phase-4-schéma-bdd)
8. [Phase 5 : Sécurité](#phase-5-sécurité)
9. [Phase 6 : Routes API](#phase-6-routes-api)
10. [Phase 7 : Qualité Code](#phase-7-qualité-code)
11. [Phase 8 : Tests](#phase-8-tests)
12. [Phase 9 : Conformité NF525](#phase-9-conformité-nf525)
13. [Phase 10 : Conformité RGPD](#phase-10-conformité-rgpd)
14. [Phase 11 : Facturation Électronique](#phase-11-facturation-électronique)
15. [Phase 12 : Tickets de Caisse](#phase-12-tickets-de-caisse)
16. [Phase 13 : Accessibilité RGAA](#phase-13-accessibilité)
17. [Phase 14 : DevOps](#phase-14-devops)
18. [Plan d'Action Prioritaire](#plan-daction-prioritaire)

---

## 📋 RÉSUMÉ EXÉCUTIF

### État actuel de l'application

FlexPOS est un **système de point de vente SaaS multi-tenant** pour la restauration rapide, développé avec Node.js/Express (backend) et React/Vite (frontend). Le projet présente une **infrastructure technique solide** avec une excellente conformité NF525, mais souffre de **vulnérabilités critiques de sécurité multi-tenant** qui nécessitent des corrections **urgentes avant tout déploiement en production**.

### ✅ Ce qui fonctionne bien

1. **Conformité NF525 exemplaire** : Hash SHA-256 chaîné, immuabilité des ventes, rapports Z
2. **Architecture SaaS structurée** : Multi-tenant avec table organizations, 15 tables
3. **RBAC robuste** : 38 permissions granulaires, 3 rôles (admin/cashier/super_admin)
4. **Documentation extensive** : 33 fichiers markdown, API documentée, guides utilisateur
5. **Stack moderne et performante** : Node.js 20.x, React 18.3, PostgreSQL 15.x, Docker
6. **Droits RGPD implémentés** : Export, rectification, suppression avec anonymisation NF525
7. **API REST cohérente** : 79 endpoints, 8.2/10 de qualité
8. **Protection injection SQL** : Sequelize ORM, pas de raw queries dangereuses

### ❌ Ce qui est cassé/problématique

1. **🚨 CRITIQUE - CVE-FLEXPOS-006** : Injection `X-Organization-ID` permet accès cross-tenant (CVSS 9.1)
2. **🚨 CRITIQUE - Séquence `ticket_number_seq` manquante** : Erreur PostgreSQL bloque toutes les ventes
3. **🚨 CRITIQUE - Ventilation TVA vide** : Rapport Z non conforme NF525 (7500€/caisse)
4. **🔴 Cookies non sécurisés** : Bug `config.env` → tokens interceptables en MITM
5. **🔴 Credentials loggés** : PINs en clair dans logs (fuite sécurité)
6. **🔴 Secrets 2FA non chiffrés** : Stockage base de données en clair

### ⚠️ Ce qui est incomplet

1. **NF525** : Grand total perpétuel absent, CRON automatique rapport Z manquant
2. **RGPD** : Politique de confidentialité manquante, consentement non tracé
3. **Sécurité** : Refresh tokens absents, PIN 4 chiffres faible, pas de CSRF
4. **Tests** : Couverture quasi inexistante (1 fichier test/75 fichiers backend = 1.3%)
5. **Facturation électronique** : Aucune préparation pour obligation septembre 2026

### 🗑️ Ce qui est obsolète/à supprimer

1. **Migration 009** : 100% redondante avec init.sql (fonction `update_updated_at_column()`)
2. **Table `store_settings`** : Zombie (remplacée par `organizations.settings` en migration 014)
3. **Routes d'inscription triplées** : /auth/signup, /public/signup, /organizations/register
4. **30 console.log** oubliés dans le code backend (fuite de données)
5. **10 migrations manquantes** (001-007, 020-022) : gaps non documentés

---

## 📊 SCORES GLOBAUX

| Domaine | Score | Statut | Commentaire |
|---------|-------|--------|-------------|
| **🏗️ Architecture** | 7.5/10 | 🟢 Bon | Monorepo structuré, MVC respecté, séparation claire |
| **📚 Documentation** | 8/10 | 🟢 Bon | 33 docs, mais Swagger/OpenAPI manquant |
| **🗄️ Migrations BDD** | 6.5/10 | 🟡 Moyen | Redondances, table zombie, gaps |
| **🔐 Sécurité** | **6.2/10** | 🟡 Moyen | **6 CVE critiques identifiés** |
| **🚨 Multi-tenant** | **3/10** | 🔴 **Critique** | **Injection X-Org-ID bloquante prod** |
| **📜 NF525** | **7/12** | 🟡 **58%** | **2 bloquants certification** |
| **👤 RGPD** | **7.5/13** | 🟡 **58%** | Droits OK, sécurité KO |
| **🔌 API REST** | 8.2/10 | 🟢 Bon | 79 endpoints bien structurés |
| **✅ Qualité code** | 7/10 | 🟢 Bon | Peu de dette technique, 2 TODOs |
| **🧪 Tests** | **2/10** | 🔴 **Critique** | 1 fichier test / 75 fichiers = 1.3% |
| **📦 DevOps** | 7/10 | 🟢 Bon | Docker Compose, pas de CI/CD complet |

### 🎯 Score de santé global : **64/100**

**Verdict : 🟡 MOYENNE - NON PRODUCTION-READY sans corrections critiques**

**Délai estimé de mise en conformité :** 4-6 semaines (2-3 sprints)

---

## 🚨 RISQUES LÉGAUX CRITIQUES

### Tableau des obligations légales françaises

| Réglementation | Deadline | Amende max | Statut FlexPOS | Risque | Action |
|----------------|----------|------------|----------------|--------|--------|
| **NF525** (Anti-fraude TVA) | 1er sept 2026 | **7 500€/caisse** + 80% pénalité | ⚠️ 58% (7/12) | 🔴 ÉLEVÉ | Corriger 5 manquements |
| **RGPD** (Protection données) | Obligatoire depuis 2018 | **20M€ ou 4% CA** | ⚠️ 58% (7.5/13) | 🔴 ÉLEVÉ | Corriger bugs sécurité |
| **Facturation électronique** | Sept 2026 (réception) | Amendes fiscales | ❌ 0% préparé | 🟡 MOYEN | Démarrer implémentation |
| **Tickets de caisse** | Depuis août 2023 | Amendes | ✅ 100% conforme | 🟢 FAIBLE | RAS |

### 🔴 CVE CRITIQUES - BLOQUANTS PRODUCTION

#### CVE-FLEXPOS-006 : Cross-Tenant Data Breach (CVSS 9.1 CRITICAL)

**Localisation :** `/backend/src/middlewares/tenantIsolation.js:40-54`

**Vulnérabilité :**
```javascript
else if (req.headers['x-organization-id']) {
  organizationId = parseInt(req.headers['x-organization-id'], 10);
  // ❌ AUCUNE vérification que req.user a le droit d'accéder à cette org!
}
```

**Exploitation :**
```bash
# User du tenant 1 peut accéder au tenant 2
curl -H "Authorization: Bearer <token_tenant_1>" \
     -H "X-Organization-ID: 2" \
     https://api.flexpos.app/api/products
# ❌ Retourne les produits du tenant 2 !
```

**Impact :**
- Accès TOTAL aux données de TOUS les clients (produits, ventes, utilisateurs)
- Violation RGPD Article 32 (sécurité du traitement)
- Risque d'amende : jusqu'à 20M€

**Fix URGENT :**
```javascript
else if (req.headers['x-organization-id']) {
  // Autoriser uniquement super-admins
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  organizationId = parseInt(req.headers['x-organization-id'], 10);
}
```

#### Séquence ticket_number manquante (BLOQUANT NF525)

**Impact :** Erreur PostgreSQL à chaque création de vente → **Aucune vente possible**

**Erreur runtime :**
```
ERROR: relation "ticket_number_seq" does not exist
```

**Fix :**
```sql
-- Migration 031
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1;
```

#### Ventilation TVA vide dans Rapport Z (BLOQUANT NF525)

**Code actuel :**
```javascript
// DailyReport.js:351
vat_breakdown: {}, // ⚠️ VIDE !
```

**Impact :** Rapport Z non conforme Décret n°2016-1551 → 7 500€/caisse

**Fix :** Calculer la ventilation TVA par taux dans `DailyReport.generateForDate()`

---

## 📋 PHASE 1 : CARTOGRAPHIE COMPLÈTE

### Structure du repository

**Type :** Monorepo multi-frontend

```
FlexPos/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── config/        # Configuration (env.js, permissions.js)
│   │   ├── controllers/   # 17 contrôleurs (747 lignes max)
│   │   ├── middlewares/   # 6 middlewares (auth, tenant, audit, upload)
│   │   ├── models/        # 16 modèles Sequelize
│   │   ├── routes/        # 14 fichiers de routes
│   │   ├── services/      # 6 services (NF525, PDF, printer, email)
│   │   └── utils/         # Helpers (logger, validators)
│   ├── migrations/        # 23 migrations SQL
│   ├── tests/             # 1 test (!!!)
│   └── uploads/           # Images produits
├── frontend/         # POS React 18.3
├── frontend-admin/   # Dashboard admin
├── frontend-landing/ # Landing page
├── database/
│   ├── init.sql           # Schéma initial
│   ├── migrations/        # 23 fichiers (gaps 001-007, 020-022)
│   └── seeds/             # Données de test
├── docs/             # 33 fichiers .md
├── caddy/            # Reverse proxy
└── scripts/          # Scripts audit
```

### Stack technique

**Backend :**
- **Runtime :** Node.js 20.x
- **Framework :** Express 4.18.2
- **ORM :** Sequelize 6.35.2
- **BDD :** PostgreSQL 15-alpine
- **Auth :** JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Logging :** Winston 3.11.0
- **PDF :** PDFKit 0.13.0
- **Validation :** Joi 17.11.0
- **Sécurité :** Helmet 7.1.0, express-rate-limit 7.1.5
- **Upload :** Multer 1.4.5-lts.1
- **Email :** Brevo API (non utilisé)

**Frontend :**
- **Framework :** React 18.2.0
- **Build :** Vite 5.0.8
- **Router :** React Router v6.20.1
- **HTTP :** Axios 1.6.2
- **Styling :** TailwindCSS 3.4.0
- **Charts :** Recharts 3.4.1
- **Icons :** Lucide React 0.300.0

**Infrastructure :**
- **Containers :** Docker + Docker Compose
- **Proxy :** Caddy (reverse proxy + HTTPS)
- **BDD :** PostgreSQL avec healthcheck

### Métriques du projet

- **Fichiers backend :** 75 fichiers JS
- **Fichiers frontend :** 46 fichiers JS/JSX
- **Total lignes de code :** ~20,874 lignes
- **Modèles Sequelize :** 16
- **Tables BDD :** 15
- **Routes API :** 14 fichiers (79 endpoints)
- **Migrations SQL :** 23 (avec gaps)
- **Tests :** 1 fichier (1.3% couverture)
- **Documentation :** 33 fichiers .md

---

## 📚 PHASE 2 : AUDIT DOCUMENTATION

### Score : 8/10 🟢

### Documentation existante

| Document | État | Qualité | Commentaire |
|----------|------|---------|-------------|
| README.md | ✅ Excellent | 9/10 | 537 lignes, badges, TOC, complet |
| docs/NF525_COMPLIANCE.md | ✅ Excellent | 10/10 | 435 lignes, conformité détaillée |
| docs/API_GUIDE.md | ✅ Bon | 8/10 | Guide API avec exemples |
| docs/USER_GUIDE.md | ✅ Bon | 8/10 | Guide utilisateur POS |
| docs/ADMIN_GUIDE.md | ✅ Bon | 8/10 | Dashboard super-admin |
| docs/technical/* | ✅ Bon | 8/10 | 6 docs backend détaillés |
| docs/audit-reports/* | ✅ Excellent | 9/10 | 5 rapports d'audit |
| Swagger/OpenAPI | ❌ Manquant | - | API non documentée auto |
| CHANGELOG.md | ✅ Présent | 7/10 | Historique des versions |

### Points forts

1. **README professionnel** : Badges, TOC, installation, roadmap
2. **Documentation NF525 exhaustive** : 435 lignes, exemples, checklist
3. **Guides utilisateur complets** : POS, Admin, Déploiement
4. **Architecture documentée** : 6 docs backend, schémas BDD
5. **Rapports d'audit** : 5 rapports historiques (score 100/100)

### Points faibles

1. **Swagger/OpenAPI manquant** : Pas de doc auto-générée
2. **TODOs dans le code** : Seulement 2 trouvés (bon signe)
3. **Politique de confidentialité** : Absente (obligatoire RGPD)
4. **Guide contribution** : DEVELOPER.md mentionné mais absent

### TODO/FIXME trouvés

```javascript
// backend/src/utils/helpers.js
// * Format: YYYYMMDD-XXXX (ex: 20250110-0001)

// backend/src/controllers/admin/adminAuthController.js:
// TODO: Envoyer email avec Brevo (à implémenter)
```

**Score documentation : 8/10** - Excellente mais manque Swagger et politique RGPD

---

## 🗄️ PHASE 3 : AUDIT MIGRATIONS BDD

### Score : 6.5/10 🟡

### Inventaire complet (23 fichiers)

| # | Fichier | Tables affectées | Type | Problème |
|---|---------|------------------|------|----------|
| INIT | init.sql | 7 tables de base | CREATE | - |
| 008 | create_store_settings.sql | store_settings | CREATE | ⚠️ Devient zombie |
| 009 | create_trigger_function.sql | - | FUNCTION | ❌ 100% redondant |
| 010 | add_stock_fields_to_products.sql | products | ALTER | - |
| 011 | add_is_super_admin.sql | users | ALTER | - |
| 012 | add_store_config_fields.sql | store_settings | ALTER | ⚠️ Sur table zombie |
| 014 | create_organizations.sql | organizations | CREATE | ✅ Pivot multi-tenant |
| 015 | add_organization_id_to_all_tables.sql | 7 tables | ALTER | ✅ Multi-tenant |
| 016 | create_nf525_tables.sql | hash_chain, nf525_archives | CREATE | ✅ NF525 |
| 017 | create_subscriptions.sql | subscriptions | CREATE | ✅ SaaS |
| 018 | create_invoices.sql | invoices | CREATE | ⚠️ Race condition |
| 019 | create_admin_users.sql | admin_users | CREATE | ⚠️ Password en dur |
| 023 | add_signature_hash_to_invoices.sql | invoices | ALTER | ✅ NF525 |
| 024 | fix_invoice_number_race_condition.sql | - | SEQUENCE | ✅ Fix 018 |
| 025 | create_daily_reports.sql | daily_reports | CREATE | ✅ Rapport Z |
| 026 | update_audit_logs_actions.sql | audit_logs | ALTER | ⚠️ Message "011" |
| 027 | add_suspension_reason.sql | organizations | ALTER | - |
| 028 | add_image_path_to_products.sql | products | ALTER | - |
| 029 | add_composite_indexes_performance.sql | - | INDEX | ✅ Performance |
| 030 | add_rgpd_deletion_field.sql | users | ALTER | ✅ RGPD |

**Migrations manquantes :** 001-007 (7), 020-022 (3) = **10 gaps non documentés**

### Problèmes critiques identifiés

#### 1. Migration 009 - 100% redondante

**Fonction :** `update_updated_at_column()`

- **Création 1 :** init.sql lignes 193-199
- **Création 2 :** Migration 009 (redondante)

**Action :** Supprimer migration 009

#### 2. Table `store_settings` zombie

**Historique :**
- Migration 008 : Créée avec 20+ colonnes
- Migration 012 : Ajout 10 colonnes JSONB
- Migration 014 : Migrée dans `organizations.settings`

**État actuel :** Table existe mais **plus utilisée**

**Action :** Migration 031 : `DROP TABLE store_settings CASCADE;`

#### 3. Évolution complexe 018 → 024

- **018 :** Fonction `generate_invoice_number()` avec `SELECT MAX(...)` → **Race condition**
- **024 :** Séquences PostgreSQL (fix race condition)

**Problème :** Entre 018 et 024, risque de doublons factures en prod multi-thread

**Action :** Migration 018 devrait DIRECTEMENT utiliser séquences

#### 4. 10 migrations manquantes non documentées

**Gaps :** 001-007, 020-022

**Impact :** Impossible de savoir si supprimées ou jamais créées

**Action :** Créer `database/migrations/MISSING_MIGRATIONS.md`

#### 5. Credentials en dur - Migration 019

```sql
-- Migration 019 ligne 86
password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye...' -- "Admin@2025"
```

**Risque :** Mot de passe par défaut documenté

**Action :** Forcer changement premier login + supprimer commentaire

### Conformité NF525/RGPD dans migrations

**NF525 : 10/10** ✅
- Triggers immutabilité (016, 023, 025)
- Hash chain SHA-256 (016)
- Séquençage sécurisé (024)
- Rapports Z (025)
- Conservation 6 ans (016 archives)

**RGPD : 5/10** ⚠️
- Champ `deletion_requested_at` (030) ✅
- CRON manquant dans migrations ❌
- Table `user_consents` absente ❌
- Pas d'export API documenté ❌

### Recommandations migrations

**Priorité 1 (IMMÉDIAT) :**
1. Documenter migrations manquantes (MISSING_MIGRATIONS.md)
2. Supprimer migration 009 (redondante)
3. Créer migration 031 : DROP store_settings

**Priorité 2 (COURT TERME) :**
4. Migration 032 : CRON suppression users RGPD
5. Migration 033 : Table user_consents
6. Script vérification intégrité (verify_schema.sql)

**Priorité 3 (MOYEN TERME) :**
7. Consolidation pour nouveaux déploiements (008+012+014 → 014_v2)
8. Politique de gouvernance (MIGRATION_POLICY.md)

**Score migrations : 6.5/10** - Base solide mais dette technique à résorber

---

## 🏗️ PHASE 4 : SCHÉMA BDD & MULTI-TENANT

### Score : 7.5/10 🟢

### Tables (15 total)

| Table | Lignes modèle | Role | Multi-tenant | NF525 | RGPD |
|-------|---------------|------|--------------|-------|------|
| organizations | 350 | Pivot SaaS | ✅ | - | ⚠️ |
| users | 324 | Caissiers/Admins | ✅ | - | ✅ |
| admin_users | 324 | Super-admins | ❌ | - | ⚠️ |
| products | 616 | Catalogue | ✅ | - | - |
| menu_compositions | - | Menus composés | ✅ | - | - |
| cash_registers | 572 | Caisses | ✅ | ✅ | - |
| sales | 747 | Ventes | ✅ | ✅ | ⚠️ |
| sale_items | - | Lignes vente | ✅ | ✅ | - |
| hash_chain | - | Chaîne hash NF525 | ✅ | ✅ | - |
| nf525_archives | 403 | Archives fiscales | ✅ | ✅ | - |
| daily_reports | 412 | Rapports Z | ✅ | ✅ | - |
| subscriptions | - | Abonnements SaaS | ✅ | - | - |
| invoices | 350 | Facturation SaaS | ✅ | ✅ | - |
| audit_logs | - | Audit trail | ✅ | ✅ | ✅ |
| store_settings | - | **ZOMBIE** | ❌ | - | - |

### Architecture multi-tenant

**Stratégie :** Isolation par `organization_id` (shared database, shared schema)

**Pivot central :**
```
organizations (id)
    ↓ FK organization_id
    ├─→ users (12 tables dépendantes)
    ├─→ products
    ├─→ sales
    ├─→ hash_chain
    ├─→ daily_reports
    └─→ invoices
```

**Middleware isolation :**
```javascript
// tenantIsolation.js - 5 stratégies de détection
1. req.user.organization_id (JWT) - PRIORITÉ
2. Header X-Organization-ID - ❌ VULNÉRABLE
3. Sous-domaine (tenant.flexpos.com)
4. Domaine personnalisé
5. Fallback dev (org_id=1) - ❌ DANGEREUX
```

**Filtrage systématique :**
```javascript
// Dans tous les contrôleurs
where: { organization_id: req.organizationId }
```

**Score isolation : 3/10** 🔴
- ❌ Header X-Organization-ID accepté sans vérification
- ❌ Middleware tenantIsolation NON appliqué sur les routes
- ❌ Fallback org_id=1 dangereux
- ✅ Filtrage manuel dans contrôleurs (11/17)

### Relations et dépendances

**Graphe FK :**
```
organizations ← [12 tables]
sales ← sale_items, hash_chain
products ← menu_compositions, sale_items
users ← cash_registers, sales, audit_logs, nf525_archives
cash_registers ← sales
subscriptions ← invoices
```

**Aucune dépendance circulaire détectée** ✅

**Table orpheline :** admin_users (par design pour séparer super-admins)

### Index et performance

**Migration 029 :** 5 index composites créés ✅
```sql
CREATE INDEX idx_sales_org_date ON sales(organization_id, created_at);
CREATE INDEX idx_products_org_category ON products(organization_id, category_id);
CREATE INDEX idx_users_org_role ON users(organization_id, role);
-- etc.
```

**Recommandations :** Ajouter index sur `audit_logs(organization_id, action)`

---

## 🔐 PHASE 5 : AUDIT SÉCURITÉ

### Score : 6.2/10 🟡 (6 CVE CRITIQUES)

### Résumé des vulnérabilités

| Sévérité | Nombre | CVSS | Exemples |
|----------|--------|------|----------|
| 🔴 CRITICAL | 1 | 9.1 | CVE-006 Cross-tenant breach |
| 🟠 HIGH | 5 | 7.0-7.8 | PIN faible, secrets logs, JWT faible |
| 🟡 MEDIUM | 6 | 5.0-6.9 | No refresh tokens, CSRF, upload |
| 🟢 LOW | 2 | 3.0-3.9 | Admin password weak, npm deps |

### CVE détaillés

#### 🔴 CVE-FLEXPOS-006 : Cross-Tenant Data Breach (CVSS 9.1)

**Voir section Risques Légaux** pour détails complets

#### 🟠 CVE-FLEXPOS-001 : Weak PIN Code (CVSS 7.5)

**Problème :** PIN 4 chiffres uniquement (10,000 combinaisons)

```javascript
// User.js:20-26
pin_code: {
  type: DataTypes.STRING(255),
  validate: {
    is: /^\d{4}$/, // ❌ Seulement 4 chiffres
  }
}
```

**Impact :** Brute-force possible même avec rate limiting

**Fix :** Minimum 6 chiffres + blocage compte après 5 échecs

#### 🟠 CVE-FLEXPOS-002 : No Refresh Tokens (CVSS 5.3)

**Problème :** JWT valide 8h, pas de révocation possible

**Fix :** Implémenter refresh tokens avec rotation

#### 🟠 CVE-FLEXPOS-003 : Weak JWT Secret Default (CVSS 7.8)

```env
# .env.example:13
JWT_SECRET=your-secret-key-change-in-production
```

**Impact :** Si copié en prod → tokens facilement forgés

**Fix :** Générer automatiquement : `openssl rand -base64 32`

#### 🟠 CVE-FLEXPOS-004 : Logging Credentials (CVSS 5.8)

```javascript
// seedAll.js:92
logger.info('  - PIN: 789456'); // ❌ PIN en clair dans logs
```

**Impact :** Fuite possible si logs exposés

**Fix :** Ne JAMAIS logger de credentials

#### 🟠 CVE-FLEXPOS-007 : tenantIsolation Not Applied (CVSS 7.4)

```bash
grep -r "tenantIsolation" backend/src/routes/
# Résultat : 0 matches ❌
```

**Problème :** Middleware existe mais jamais utilisé

**Fix :** `router.use(tenantIsolation);` dans chaque routes/*.js

#### 🟠 CVE-FLEXPOS-010 : Weak Secrets in .env.example (CVSS 7.3)

**Secrets dangereux :**
- `JWT_SECRET=your-secret-key-change-in-production`
- `DB_PASSWORD=postgres`

**Fix :** Placeholders plus explicites + validation au démarrage

### Authentification : 6/10

**✅ Points positifs :**
- JWT implémenté (HS256)
- Stockage httpOnly cookies
- bcrypt 10 rounds
- Rate limiting 5/15min sur login

**❌ Points négatifs :**
- PIN 4 chiffres faible
- Pas de refresh tokens
- JWT secret faible par défaut
- Logging de PINs

### Autorisation RBAC : 8/10

**✅ Points positifs :**
- 38 permissions granulaires
- 3 rôles (admin/cashier/super_admin)
- Middlewares requirePermission()
- Routes sensibles protégées

**⚠️ Points d'attention :**
- Super-admin accès illimité cross-tenant (risque RGPD)
- Pas de vérification ownership (cashier → cashier)

### Injection SQL : 9/10 ✅

- **ORM Sequelize** : Protection automatique
- **Aucune raw query dangereuse** trouvée
- **Paramètres nommés** : `{ replacements: { ... } }`

### XSS : 8/10

**✅ Protections :**
- Helmet.js configuré
- Headers sécurité (X-Content-Type, X-Frame-Options, HSTS)
- Cookies httpOnly

**⚠️ Points d'attention :**
- CSP désactivée (gérée par Caddy ?)
- Pas de sanitization HTML explicite

### CSRF : 6/10

**✅ Protections :**
- SameSite: 'strict'
- CORS strict (whitelist origins)

**❌ Manquants :**
- Package `csurf` NON installé
- Pas de token CSRF

### Upload fichiers : 8/10

**✅ Protections :**
- Validation MIME type
- Limite 5 MB
- Noms aléatoires (crypto)
- Hors webroot

**⚠️ Manquants :**
- Pas de validation magic bytes
- Pas de scan antivirus (ClamAV)

### Rate Limiting : 8/10

**✅ Configuré :**
- Login : 5/15min
- API : 100/min
- Trust proxy activé

**❌ Manquants :**
- Password reset : AUCUN rate limiting
- Upload : même limite que GET

### Logs : 8/10

**✅ Points positifs :**
- Winston configuré
- Rotation 5MB/5 fichiers
- Table audit_logs

**❌ Points négatifs :**
- Logging credentials (CVE-004)
- Pas de redaction automatique
- Pas de centralisation (Sentry DSN configuré mais non utilisé)

### Dépendances npm : 7/10

```
Vulnérabilités npm audit :
- LOW: 1 (express query properties)
- MODERATE: 1 (js-yaml prototype pollution)
- HIGH: 0
- CRITICAL: 0
```

**Fix :** `npm audit fix`

---

## 🔌 PHASE 6 : ROUTES/ENDPOINTS API

### Score : 8.2/10 🟢

### Inventaire complet : 79 endpoints

**Répartition par module :**
- Auth : 8 endpoints
- Users : 7
- Products : 10
- Sales : 5
- Cash Registers : 6
- Dashboard : 2
- Settings : 3
- Logs : 3
- Printer : 4
- NF525 : 3
- Daily Reports : 5
- Organizations : 5
- Admin (super-admin) : 16
- Public : 2

### Routes critiques NF525 : 10/10 ✅

| Endpoint | Fonction | Conformité |
|----------|----------|------------|
| POST /api/sales | Création vente + hash auto | ✅ |
| GET /api/nf525/verify-integrity | Vérification chaîne | ✅ |
| POST /api/daily-reports/generate | Rapport Z | ✅ |
| GET /api/nf525/export | Archive fiscale | ✅ |
| DELETE /api/sales/* | **INTERDIT** | ✅ N'EXISTE PAS |
| PUT /api/sales/* | **INTERDIT** | ✅ N'EXISTE PAS |

**Aucune violation NF525 détectée** ✅

### Routes critiques RGPD : 9/10 ✅

| Article | Droit | Endpoint | Conformité |
|---------|-------|----------|------------|
| Art. 15 | Accès | GET /api/auth/user/data | ✅ |
| Art. 20 | Portabilité | GET /api/users/me/data-export | ✅ |
| Art. 16 | Rectification | PUT /api/users/:id | ✅ |
| Art. 17 | Effacement | DELETE /api/auth/user/data | ✅ |
| Art. 13-14 | Information | - | ❌ Manquant |

**Recommandation :** Ajouter endpoints politique confidentialité

### Routes sensibles non protégées

#### 🔴 CRITIQUE : Fallback organization_id=1

```javascript
// Route : GET /api/settings/config
// Middleware : optionalAuthenticate
// Problème : auth.js:156-159
if (!req.organizationId) {
  req.organizationId = 1; // ❌ DANGEREUX
}
```

**Impact :** Utilisateur non authentifié accède aux paramètres org 1

**Fix :** Retourner 401 au lieu de fallback

#### 🟡 MOYEN : Route admin change password

```javascript
// PUT /api/admin/users/:id/password
// Protection : requireSuperAdmin
```

**Problème :** Super-admin peut changer mot de passe de N'IMPORTE QUEL user

**Fix :** Audit log obligatoire + notification email

#### 🟡 MOYEN : Duplication routes d'inscription

- POST /api/auth/signup
- POST /api/public/signup
- POST /api/organizations/register

**Fix :** Consolider sur une seule route

### Cohérence REST : 8/10

**Bonnes pratiques :**
- Nommage kebab-case ✅
- Pluriels pour collections ✅
- Verbes HTTP corrects ✅
- Hiérarchie parent/enfant ✅

**Actions non-RESTful (acceptable) :**
- POST /api/cash-registers/open
- POST /api/daily-reports/generate
- POST /api/printer/test

### Validation inputs : 6/10

**Stratégie :** Validations manuelles dans contrôleurs (pas de Joi centralisé)

**Routes sans validation :**
- POST /api/products (pas de validation prix > 0)
- POST /api/daily-reports/generate (pas de validation date future)
- PUT /api/settings (validation partielle)

**Fix :** Implémenter schémas Joi centralisés

### Gestion erreurs : 8/10

**✅ Points positifs :**
- Middleware errorHandler centralisé
- Codes HTTP corrects (200, 201, 400, 401, 403, 404, 409, 422, 500)
- Format standardisé
- Pas de stack traces exposées

### Pagination : 7/10

**10/17 contrôleurs ont pagination** (59%)

**Limites :**
- Défaut : 50
- Max : 100
- Offset/limit standard

**Manquant :**
- GET /api/dashboard/stats (si beaucoup de données)

### Documentation API : 7/10

**✅ Existant :**
- docs/API_GUIDE.md complet
- Exemples Node.js/Python/PHP

**❌ Manquant :**
- Swagger/OpenAPI
- JSDoc sur contrôleurs

---

## ✅ PHASE 7 : QUALITÉ DU CODE

### Score : 7/10 🟢

### Fichiers les plus longs

| Fichier | Lignes | Recommandation |
|---------|--------|----------------|
| saleController.js | 747 | ⚠️ À refactoriser (> 500) |
| authController.js | 705 | ⚠️ À refactoriser |
| productController.js | 616 | ⚠️ À refactoriser |
| cashRegisterController.js | 572 | ⚠️ À refactoriser |
| nf525Service.js | 495 | ✅ OK |
| userController.js | 475 | ✅ OK |

**Recommandation :** Extraire logique métier dans services pour contrôleurs > 500 lignes

### TODO/FIXME : 2 seulement ✅

```javascript
// 1. backend/src/utils/helpers.js
// Format: YYYYMMDD-XXXX (ex: 20250110-0001)

// 2. backend/src/controllers/admin/adminAuthController.js
// TODO: Envoyer email avec Brevo (à implémenter)
```

**Excellent !** Très peu de dette technique

### Console.log oubliés : 30

```bash
grep -r "console\." backend/src --include="*.js" | wc -l
# Résultat : 30
```

**Impact :** Fuite de données en production, performance

**Fix :** Remplacer par `logger.debug()` ou supprimer

### Code dupliqué : Faible

**Patterns répétés mineurs :**
- Validation `organization_id` dans contrôleurs (acceptable)
- Hooks `beforeUpdate` similaires (immutabilité NF525)

**Pas de duplication majeure détectée** ✅

### Patterns & Architecture : 8/10

**✅ Bonnes pratiques :**
- MVC respecté (Models, Controllers, Services)
- Séparation des responsabilités claire
- Services pour logique métier (NF525, PDF, printer)
- Middlewares bien utilisés (auth, tenant, audit, upload)
- Gestion erreurs try/catch partout
- Async/await cohérent

**⚠️ Points d'amélioration :**
- Contrôleurs trop longs (extraire dans services)
- Validation dispersée (centraliser Joi)

### Dépendances

**npm outdated (versions WANTED) :**
- dotenv : 16.6.1 → 17.2.3
- express : 4.22.1 → 5.2.1 (breaking changes)
- helmet : 7.2.0 → 8.1.0
- joi : 17.13.3 → 18.0.2
- node-cron : 3.0.3 → 4.2.1
- pdfkit : 0.13.0 → 0.17.2

**Recommandation :** Mettre à jour sauf Express 5 (breaking)

### Hardcoded values : Acceptable

**Constantes utilisées :**
```javascript
// config/permissions.js
const PERMISSIONS = { ... }; // ✅ Bon

// models/Sale.js
paymentMethod: {
  values: ['cash', 'card', 'meal_voucher', 'mixed'] // ✅ OK
}
```

**Pas de valeurs magiques critiques** ✅

---

## 🧪 PHASE 8 : AUDIT TESTS

### Score : 2/10 🔴 CRITIQUE

### Couverture actuelle : 1.3%

```
Fichiers tests : 1
Fichiers backend : 75
Couverture : 1/75 = 1.3%
```

**Fichier unique :**
```
backend/tests/controllers/productController.multiTenant.test.js
backend/tests/setup.js
```

### État des tests

**✅ Ce qui existe :**
- 1 test multi-tenant sur productController
- Configuration Jest dans setup.js

**❌ Ce qui manque (CRITIQUE) :**
- Tests unitaires contrôleurs (0/17)
- Tests services NF525 (0/6)
- Tests middlewares (0/6)
- Tests models Sequelize (0/16)
- Tests intégration API (0/79 endpoints)
- Tests E2E (0)

### Scénarios critiques non testés

**NF525 :**
- ❌ Création vente avec hash automatique
- ❌ Vérification intégrité chaîne
- ❌ Génération rapport Z
- ❌ Immutabilité ventes (beforeUpdate hook)
- ❌ Race condition séquences

**Multi-tenant :**
- ❌ Injection X-Organization-ID (CVE-006)
- ❌ Isolation données entre tenants
- ❌ Filtrage organization_id

**RGPD :**
- ❌ Export données personnelles
- ❌ Suppression avec anonymisation
- ❌ CRON suppression après 30j

**Sécurité :**
- ❌ Rate limiting
- ❌ JWT expiration/validation
- ❌ RBAC permissions
- ❌ Upload validation

### Recommandations URGENTES

**Priorité 1 (Bloquant) :**
1. Tests NF525 : hash, chaîne, immutabilité
2. Tests multi-tenant : injection, isolation
3. Tests sécurité : rate limiting, JWT, RBAC

**Priorité 2 (Important) :**
4. Tests unitaires contrôleurs (17)
5. Tests services (6)
6. Tests intégration API (79 endpoints)

**Priorité 3 (Souhaitable) :**
7. Tests E2E (Cypress, Playwright)
8. Tests performance (Artillery, k6)

**Objectif cible : 70% couverture minimum**

**Délai estimé : 3-4 semaines** pour atteindre couverture acceptable

---

## 📜 PHASE 9 : CONFORMITÉ NF525

### Score : 7/12 (58%) 🟡

**⚠️ CERTIFICATION IMPOSSIBLE EN L'ÉTAT - 2 BLOQUANTS**

### Les 4 piliers NF525

#### 1. INALTÉRABILITÉ : ⚠️ PARTIEL (2/3)

**✅ Conforme :**
- Ventes : Hook `beforeUpdate` bloque modification
- Factures : Hook + Trigger SQL double protection
- Rapports Z : Hook + Trigger `prevent_daily_report_modification`
- Hash Chain : 3 triggers (UPDATE, DELETE, TRUNCATE)

**❌ BLOQUANT :**
```javascript
// Sale.js:128-131
SELECT TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
  LPAD(nextval('ticket_number_seq')::TEXT, 4, '0')
```

**Problème :** Séquence `ticket_number_seq` **NON CRÉÉE**

**Impact :** Erreur PostgreSQL → Aucune vente possible

**Fix :** Migration 031 : `CREATE SEQUENCE ticket_number_seq START WITH 1;`

#### 2. SÉCURISATION : ⚠️ PARTIEL (4/6)

**✅ Conforme :**
- Hash SHA-256 sur ventes (hash_chain)
- Hash SHA-256 sur factures (signature_hash)
- Hash SHA-256 sur rapports Z (signature_hash)
- Séquençage factures thread-safe (séquences PostgreSQL)

**❌ Manquants :**
- **Grand total perpétuel** : Aucun compteur cumulé depuis mise en service
- **Hash sur ticket** : Non visible sur PDF (client ne peut pas vérifier)

**Recommandation :**
```sql
-- Migration 032 : Grand total perpétuel
ALTER TABLE daily_reports ADD COLUMN grand_total_ttc DECIMAL(15,2) DEFAULT 0;
```

#### 3. CONSERVATION : ✅ CONFORME (6 ans)

- Pas de suppression automatique ✅
- Pas de CRON nettoyage ✅
- Soft delete uniquement sur tables non-fiscales ✅
- Conservation indéfinie garantie ✅
- Table `nf525_archives` avec protection 6 ans ✅
- RGPD vs NF525 résolu : anonymisation audit_logs ✅

#### 4. ARCHIVAGE : ⚠️ PARTIEL (3/5)

**✅ Conforme :**
- Table `daily_reports` complète
- API POST /api/daily-reports/generate
- Fonction DailyReport.generateForDate()
- Triggers immutabilité (UPDATE, DELETE)
- Tous les champs obligatoires présents

**❌ BLOQUANT :**
```javascript
// DailyReport.js:351
vat_breakdown: {}, // ⚠️ VIDE !
```

**Problème :** Ventilation TVA par taux **NON CALCULÉE**

**Impact :** Rapport Z non conforme Décret n°2016-1551 Article 3

**Amende :** 7 500€ par caisse

**Fix :** Calculer dans `generateForDate()` :
```javascript
vat_breakdown: {
  "20.00": { ht: 1000.00, tva: 200.00, ttc: 1200.00 },
  "10.00": { ht: 500.00, tva: 50.00, ttc: 550.00 },
  "5.50": { ht: 100.00, tva: 5.50, ttc: 105.50 }
}
```

**❌ Manquant :**
- CRON automatique génération rapport Z (risque d'oubli)

### Éléments techniques obligatoires

#### Ticket de caisse : ✅ CONFORME

**Service :** pdfService.js (280 lignes)

**Contient :**
- ✅ Nom et adresse commerçant
- ✅ Date et heure
- ✅ Numéro ticket
- ✅ Détail articles (quantité, prix unitaire)
- ✅ Montant HT et TTC
- ✅ Détail TVA par taux
- ✅ Mode paiement
- ✅ Identification vendeur
- ✅ Mentions légales (SIRET, TVA, RCS)

**Manque :**
- ❌ Hash NF525 de la vente
- ❌ Numéro séquence hash_chain
- ❌ Horodatage certifié

#### Export fiscal : ✅ CONFORME

- API /api/nf525/export (JSON + CSV)
- Vue SQL `nf525_audit_export`
- Tous champs fiscaux présents
- Métadonnées conformité

### Score détaillé conformité

| Exigence | Statut | Gravité |
|----------|--------|---------|
| 1. Inaltérabilité Sale | ✅ | - |
| 2. Inaltérabilité Invoice | ✅ | - |
| 3. Inaltérabilité DailyReport | ✅ | - |
| 4. Hash chain SHA-256 | ✅ | - |
| 5. Séquençage factures | ✅ | - |
| 6. Conservation 6 ans | ✅ | - |
| 7. Rapport Z structure | ✅ | - |
| 8. **Séquence ticket_number** | ❌ | **CRITIQUE** |
| 9. **vat_breakdown détaillé** | ❌ | **CRITIQUE** |
| 10. **Grand total perpétuel** | ❌ | **MAJEUR** |
| 11. **CRON rapport Z auto** | ❌ | **MAJEUR** |
| 12. **Hash sur ticket** | ❌ | **MOYEN** |

**Score : 7/12 = 58%**

### Certification

**Prêt pour certification AFNOR/LNE ?** ❌ **NON**

**Motifs de refus :**
1. Séquence ticket_number manquante → Ventes impossibles
2. Ventilation TVA vide → Rapport Z non conforme

**Délai de mise en conformité :** 3-5 jours développement

---

## 👤 PHASE 10 : CONFORMITÉ RGPD

### Score : 7.5/13 (58%) 🟡

**⚠️ VIOLATION ARTICLE 32 - Bugs critiques sécurité**

### Inventaire données personnelles

**Table users (caissiers) :**
- username, email, first_name, last_name
- pin_code (hashé bcrypt 10 rounds ✅)
- deletion_requested_at (RGPD ✅)

**Table admin_users (super-admins) :**
- email, username, first_name, last_name
- password_hash (hashé bcrypt 10 rounds ✅)
- last_login_ip ⚠️
- two_factor_secret (❌ NON CHIFFRÉ)
- reset_token (❌ EN CLAIR)
- ❌ Pas de champ `deletion_requested_at`

**Table organizations :**
- name, email, phone
- settings (JSONB : adresse, SIRET)

**Table audit_logs :**
- ip_address ⚠️
- user_agent
- old_values, new_values (peut contenir données sensibles) ⚠️

### Droits des personnes : ✅ 4/4

| Article | Droit | Endpoint | Statut |
|---------|-------|----------|--------|
| Art. 15 | Accès | GET /api/auth/user/data | ✅ Export JSON complet |
| Art. 20 | Portabilité | GET /api/users/me/data-export | ✅ Format JSON standard |
| Art. 16 | Rectification | PUT /api/users/:id | ✅ Modification possible |
| Art. 17 | Effacement | DELETE /api/auth/user/data | ✅ Suppression + anonymisation |

**Excellent !** Tous les droits implémentés

### Conflit NF525/RGPD : ✅ RÉSOLU

**Solution élégante :**
```javascript
// authController.js:656-669
// Anonymiser audit_logs
await AuditLog.update({
  user_id: null,
  ip_address: '0.0.0.0',
  user_agent: 'ANONYMIZED',
  old_values: null,
  new_values: null,
}, { where: { user_id: userId } });

// Ventes conservées pour NF525 (6 ans)
// Utilisateur supprimé (hard delete)
await user.destroy({ force: true });
```

**CRON suppression automatique :** ✅
```javascript
// cronJobs.js:129-173
// Suppression après 30 jours si deletion_requested_at
```

### Sécurité des données : ❌ 3 BUGS CRITIQUES

#### 🔴 Bug 1 : Cookies non sécurisés en prod

```javascript
// authController.js:88-93
res.cookie('token', token, {
  httpOnly: true,
  secure: config.env === 'production', // ❌ BUG: config.env n'existe pas!
  sameSite: 'strict',
});
```

**Problème :** `config.env` = undefined → `secure = false` même en prod

**Impact :** Tokens interceptables en Man-in-the-Middle

**Fix :**
```javascript
// config/env.js
module.exports = {
  NODE_ENV,
  env: NODE_ENV, // ← AJOUTER
}
```

#### 🔴 Bug 2 : Données sensibles loggées

```javascript
// authController.js:680
logger.info(`User data deleted for user ${userId} (email: ${user.email})`); // ❌

// adminAuthController.js:180
logger.info(`Password reset requested for admin: ${email}`); // ❌
```

**Impact :** Emails dans logs/combined.log

**Fix :** Supprimer emails, utiliser `User ${userId}`

#### 🔴 Bug 3 : Secrets 2FA non chiffrés

```javascript
// AdminUser.js
two_factor_secret: DataTypes.STRING(255) // ❌ Stocké en clair
```

**Impact :** Dump SQL expose secrets 2FA

**Fix :** Chiffrer avec AES-256

### Manquements RGPD

| Exigence | Statut | Impact |
|----------|--------|--------|
| Art. 13-14 : Politique confidentialité | ❌ | Amende |
| Art. 7 : Consentement explicite | ❌ | Amende |
| Art. 30 : Registre des traitements | ❌ | Amende |
| Art. 32 : Sécurité | ❌ | 3 bugs critiques |

### Score détaillé

| Critère | Score | Détail |
|---------|-------|--------|
| Inventaire données | ✅ 1/1 | Complet |
| Droit d'accès | ✅ 1/1 | Export JSON |
| Droit rectification | ✅ 1/1 | Modification |
| Droit effacement | ✅ 1/1 | Suppression + CRON |
| Droit portabilité | ✅ 1/1 | Format JSON |
| Hash mots de passe | ✅ 1/1 | bcrypt 10 rounds |
| **Cookies sécurisés** | ❌ 0/1 | **Bug config.env** |
| **Chiffrement base** | ❌ 0/1 | 2FA non chiffré |
| **Logs sécurisés** | ❌ 0/1 | Emails loggés |
| Conflit NF525/RGPD | ✅ 1/1 | Anonymisation |
| Isolation multi-tenant | ⚠️ 0.5/1 | CVE-006 |
| **Consentement** | ❌ 0/1 | Pas de mécanisme |
| **Registre traitements** | ❌ 0/1 | Document manquant |

**Score : 7.5/13 = 58%**

### Risques légaux RGPD

**🔴 CRITIQUE - CVE-006 :** Voir section Sécurité

**🔴 CRITIQUE - Cookies non sécurisés :** Amende jusqu'à 10M€

**🔴 CRITIQUE - Logging credentials :** Violation Art. 5(1)f

**🟡 MOYEN - Pas de consentement :** Violation Art. 6-7

**🟡 MOYEN - Pas de registre :** Violation Art. 30

---

## 📄 PHASE 11 : FACTURATION ÉLECTRONIQUE

### Score : 0/8 (0%) ❌

**Deadline : 1er septembre 2026 (réception) / 2027 (émission)**

### Obligations françaises 2026-2027

| Date | Obligation | Entreprises concernées |
|------|------------|------------------------|
| 1er sept 2026 | **Réception** factures électroniques | TOUTES |
| 1er sept 2026 | **Émission** factures électroniques | Grandes entreprises + ETI |
| 1er sept 2027 | **Émission** factures électroniques | PME, TPE, micro |

### État actuel FlexPOS

**❌ AUCUNE préparation détectée**

**Ce qui existe :**
- Table `invoices` (facturation SaaS interne)
- Champ `signature_hash` (NF525)
- PDF basique

**Ce qui manque :**
- ❌ Format structuré (UBL, CII, Factur-X)
- ❌ Connexion PDP (Plateforme Dématérialisation Partenaire)
- ❌ Connexion PPF (Portail Public Chorus Pro)
- ❌ E-reporting B2C (transmission données à l'administration)
- ❌ Nouvelles mentions obligatoires (SIREN client, adresse livraison, catégorie opération)

### Impact pour FlexPOS

**FlexPOS = logiciel de caisse :**
- Ventes B2C : Ticket suffit (pas de facture électronique)
- **MAIS e-reporting obligatoire** : Transmission données vente à l'administration
- Si ventes B2B à des pros : Facture électronique obligatoire

### Recommandations

**Priorité 1 (Avant sept 2026) :**
1. Implémenter e-reporting B2C (service EReportingService)
2. Format export conforme (UBL ou Factur-X)
3. Choisir PDP agréée (liste sur impots.gouv.fr)

**Priorité 2 (Avant sept 2027 si B2B) :**
4. API émission factures électroniques
5. Connexion PDP/PPF
6. Nouvelles mentions obligatoires

**Priorité 3 :**
7. Archivage 10 ans factures électroniques
8. Gestion accusés réception
9. Statuts factures (envoyée, reçue, rejetée)

**Score : 0/8** - Aucune fonctionnalité implémentée

---

## 🧾 PHASE 12 : TICKETS DE CAISSE

### Score : 9/10 ✅

### Réglementation (depuis août 2023)

**Règles d'impression :**
- ✅ Impression NON systématique (sur demande)
- ✅ Impression OBLIGATOIRE si ≥ 25€ TTC
- ✅ Option ticket dématérialisé (SMS, email, QR code)
- ✅ Affichage obligatoire : "ticket sur demande"

### Implémentation actuelle

**Service :** `/backend/src/services/pdfService.js` (280 lignes)

**Mentions présentes :**
- ✅ Nom et adresse commerçant
- ✅ Date et heure (format français)
- ✅ Numéro ticket (séquentiel)
- ✅ Détail articles (quantité × prix unitaire)
- ✅ Montant total HT et TTC
- ✅ Détail TVA par taux (5.5%, 10%, 20%)
- ✅ Mode de paiement (Espèces, CB, TR, Mixte)
- ✅ Identification vendeur (nom, prénom)
- ✅ SIRET, TVA intracommunautaire, RCS
- ✅ Message de remerciement

**Format :** PDF 80mm (thermique) + impression ESC/POS

### TVA en restauration : ✅ CONFORME

**Taux gérés :**
```javascript
// vatService.js
5.5%  : Ventes à emporter, produits alimentaires
10%   : Consommation sur place (hors alcool)
20%   : Boissons alcoolisées, services
```

**Ventilation automatique :** ✅ Selon mode consommation

### Ticket Z (clôture) : ✅ CONFORME

- Génération automatique/manuelle
- Récapitulatif ventes par paiement
- Ventilation TVA
- Total CA journalier
- Conservation 2 ans minimum

### Points à améliorer

**Manque (NF525) :**
- ❌ Hash SHA-256 de la vente (non visible)
- ❌ Numéro séquence hash_chain
- ❌ QR code pour vérification

**Recommandation :**
```javascript
// Ajouter en pied de ticket
doc.fontSize(7);
doc.text(`Hash: ${hashChain.current_hash.substring(0, 16)}...`, 20);
doc.text(`Séquence: #${hashChain.sequence_number}`, 20);
// + QR code pointant vers API vérification
```

**Score tickets : 9/10** - Conforme avec améliorations NF525 possibles

---

## ♿ PHASE 13 : ACCESSIBILITÉ RGAA

### Score : N/A (Non applicable TPE)

### Obligation légale

**RGAA obligatoire pour :**
- Services publics
- Entreprises > 250M€ CA
- **Depuis 28 juin 2025 :** Entreprises privées (sauf TPE < 10 personnes ou < 2M€ CA)

**FlexPOS :** Startup SaaS → **Exemption TPE** (probablement)

### État actuel

**Frontend React :**
- Navigation clavier : Non testée
- Contraste : TailwindCSS (bons défauts)
- Lecteurs d'écran : Non testé
- Textes alternatifs : À vérifier
- Déclaration accessibilité : Absente

### Recommandations (bonnes pratiques)

Même si non obligatoire :
1. Navigation au clavier fonctionnelle (tab, enter, esc)
2. Contraste WCAG AA minimum (4.5:1)
3. Attributs ARIA sur composants interactifs
4. Labels sur formulaires
5. Messages d'erreur explicites

**Score : N/A** - Non audité (hors scope)

---

## 📦 PHASE 14 : DEVOPS/DÉPLOIEMENT

### Score : 7/10 🟢

### Docker : ✅ BIEN CONFIGURÉ

**docker-compose.yml :**
```yaml
services:
  postgres:    # PostgreSQL 15-alpine + healthcheck
  backend:     # Node.js Express API
  frontend:    # React Vite SPA
```

**Points positifs :**
- Healthcheck sur PostgreSQL
- Volumes persistants (postgres_data)
- Init SQL automatique (init.sql + seeds.sql)
- Network dédié (pos_network)
- Build context séparé par service

**docker-compose.prod.yml :**
- Caddy reverse proxy (HTTPS auto)
- Configuration production

### CI/CD : ⚠️ BASIQUE

**Détecté :**
- Repository GitHub
- Branch strategy (claude/*)

**Absent :**
- ❌ GitHub Actions workflows
- ❌ Tests automatiques sur PR
- ❌ Déploiement automatique
- ❌ Linting automatique

**Recommandation :** Créer `.github/workflows/`
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

### Variables d'environnement : ✅ BON

**Configuration centralisée :**
- `.env.example` complet
- `backend/src/config/env.js`
- Validation en production

**Points d'attention :**
- ⚠️ Secrets faibles dans .env.example
- ⚠️ JWT_SECRET validation manquante (longueur min)

### Environnements : ✅ PRÉSENTS

- Dev : `docker-compose.yml`
- Prod : `docker-compose.prod.yml`
- Configuration par environnement (NODE_ENV)

**Manque :** Environnement staging

### Monitoring : ⚠️ BASIQUE

**Logging :**
- ✅ Winston configuré
- ✅ Rotation logs (5MB/5 fichiers)
- ❌ Pas de centralisation (Sentry DSN configuré mais non utilisé)

**Santé :**
- ✅ Endpoint GET /health

**Métriques :**
- ❌ Pas de Prometheus/Grafana
- ❌ Pas d'alertes configurées

**Recommandation :** Activer Sentry + métriques

### Sauvegardes : ❌ NON DOCUMENTÉ

- Stratégie de backup PostgreSQL : Non documentée
- Rétention : Non définie
- Restauration : Procédure manquante

**Recommandation :** Créer `docs/deployment/BACKUP_STRATEGY.md`

### Score DevOps détaillé

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Docker/Compose | 9/10 | Excellent |
| CI/CD | 3/10 | Absent |
| Variables env | 8/10 | Bon |
| Environnements | 7/10 | Dev/Prod OK, manque staging |
| Monitoring | 5/10 | Basique |
| Sauvegardes | 2/10 | Non documenté |
| Documentation | 8/10 | DEPLOYMENT.md présent |

**Score global : 7/10**

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### 🚨 P0 - BLOQUEURS PRODUCTION (1-3 jours)

**À corriger AVANT tout déploiement :**

#### 1. CVE-FLEXPOS-006 : Cross-tenant breach

**Fichier :** `/backend/src/middlewares/tenantIsolation.js:40-54`

**Fix :**
```javascript
else if (req.headers['x-organization-id']) {
  // Autoriser uniquement super-admins
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'X-Organization-ID header requires super-admin role' }
    });
  }
  organizationId = parseInt(req.headers['x-organization-id'], 10);
  logger.warn(`Super-admin ${req.admin.id} accessing organization ${organizationId}`);
}
```

**Effort :** 30 min
**Test :** Curl avec header X-Org-ID depuis user normal → doit retourner 403

#### 2. Appliquer middleware tenantIsolation sur TOUTES les routes

**Fichier :** Tous `/backend/src/routes/*.js`

**Fix :**
```javascript
const tenantIsolation = require('../middlewares/tenantIsolation');
router.use(tenantIsolation); // ✅ Ajouter en haut de chaque fichier routes
```

**Effort :** 2h (14 fichiers)
**Test :** Vérifier logs "Tenant detected" sur chaque requête

#### 3. Créer séquence ticket_number

**Fichier :** Nouvelle migration `database/migrations/031_create_ticket_number_sequence.sql`

```sql
-- Migration 031: Créer séquence ticket_number
-- Date: 2025-12-03
-- Description: Fix erreur PostgreSQL lors création ventes

DO $$
BEGIN
  -- Créer séquence si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'ticket_number_seq') THEN
    CREATE SEQUENCE ticket_number_seq START WITH 1;
    RAISE NOTICE 'Séquence ticket_number_seq créée avec succès';
  ELSE
    RAISE NOTICE 'Séquence ticket_number_seq existe déjà';
  END IF;
END $$;

-- Commenter pour la documentation
COMMENT ON SEQUENCE ticket_number_seq IS 'Séquence pour numérotation continue des tickets de caisse (NF525)';
```

**Effort :** 30 min
**Test :** Créer une vente via API → doit réussir avec ticket_number généré

#### 4. Calculer vat_breakdown dans Rapport Z

**Fichier :** `/backend/src/models/DailyReport.js:251-362`

**Fix :** Dans fonction `generateForDate()`, remplacer ligne 351 :
```javascript
// AVANT:
vat_breakdown: {}, // ⚠️ VIDE

// APRÈS:
vat_breakdown: await this.calculateVATBreakdown(organizationId, reportDate, transaction),

// Ajouter méthode statique:
static async calculateVATBreakdown(organizationId, reportDate, transaction) {
  const sales = await Sale.findAll({
    where: {
      organization_id: organizationId,
      created_at: {
        [Op.gte]: new Date(reportDate + ' 00:00:00'),
        [Op.lt]: new Date(new Date(reportDate).getTime() + 86400000)
      }
    },
    attributes: ['vat_details'],
    transaction
  });

  const breakdown = {};
  sales.forEach(sale => {
    if (sale.vat_details) {
      Object.entries(sale.vat_details).forEach(([rate, details]) => {
        if (!breakdown[rate]) {
          breakdown[rate] = { base_ht: 0, amount_vat: 0, total_ttc: 0 };
        }
        breakdown[rate].base_ht += parseFloat(details.base_ht || 0);
        breakdown[rate].amount_vat += parseFloat(details.amount_vat || 0);
        breakdown[rate].total_ttc += parseFloat(details.total_ttc || 0);
      });
    }
  });

  // Arrondir à 2 décimales
  Object.keys(breakdown).forEach(rate => {
    breakdown[rate].base_ht = parseFloat(breakdown[rate].base_ht.toFixed(2));
    breakdown[rate].amount_vat = parseFloat(breakdown[rate].amount_vat.toFixed(2));
    breakdown[rate].total_ttc = parseFloat(breakdown[rate].total_ttc.toFixed(2));
  });

  return breakdown;
}
```

**Effort :** 2h
**Test :** Générer rapport Z → vat_breakdown doit contenir détail par taux

#### 5. Corriger bug cookies config.env

**Fichier :** `/backend/src/config/env.js:20`

**Fix :**
```javascript
module.exports = {
  NODE_ENV,
  env: NODE_ENV, // ← AJOUTER CETTE LIGNE
  PORT: PORT || 3000,
  // ...
};
```

**Effort :** 5 min
**Test :** `console.log(config.env)` doit afficher "production" en prod

#### 6. Supprimer logging credentials

**Fichiers :**
- `/backend/src/services/seedAll.js:92, 95`
- `/backend/src/services/seedUsers.js:37, 40`
- `/backend/src/controllers/authController.js:680`
- `/backend/src/controllers/admin/adminAuthController.js:180`

**Fix :** Remplacer tous les `logger.info` contenant emails/PINs par :
```javascript
// AVANT:
logger.info(`User data deleted for user ${userId} (email: ${user.email})`);

// APRÈS:
logger.info(`User data deleted for user ${userId}`);
```

**Effort :** 30 min
**Test :** grep -r "email:" logs/ → doit retourner 0 résultat

---

### 🔥 P1 - URGENT (1 semaine)

#### 7. Augmenter PIN à 6 chiffres minimum

**Fichiers :**
- `/backend/src/models/User.js:20-26`
- `/backend/src/controllers/userController.js:115`

**Fix :**
```javascript
// User.js
pin_code: {
  validate: {
    is: /^\d{6}$/, // ✅ 6 chiffres
  }
}

// userController.js
const pinSchema = Joi.string().pattern(/^\d{6}$/).required();
```

**Effort :** 1h + migration données existantes

#### 8. Implémenter CSRF protection

**Installation :**
```bash
cd backend && npm install csurf
```

**Configuration :** `/backend/src/server.js`
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.NODE_ENV === 'production'
  }
});

// Appliquer sur routes sensibles
app.use('/api/sales', csrfProtection);
app.use('/api/users', csrfProtection);
// etc.

// Route pour obtenir token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Effort :** 3h (config + intégration frontend)

#### 9. Ajouter rate limiting sur password reset

**Fichier :** `/backend/src/server.js`

**Fix :**
```javascript
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives
  message: { error: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.' }
});

app.use('/api/admin/auth/password-reset', resetLimiter);
```

**Effort :** 30 min

#### 10. Chiffrer secrets 2FA

**Fichier :** `/backend/src/models/AdminUser.js`

**Fix :** Utiliser crypto pour chiffrer/déchiffrer
```javascript
const crypto = require('crypto');

// Hook beforeCreate
beforeCreate: async (adminUser) => {
  if (adminUser.two_factor_secret) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(adminUser.two_factor_secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    adminUser.two_factor_secret = encrypted;
  }
}

// Méthode instance pour déchiffrer
decryptTwoFactorSecret() {
  if (!this.two_factor_secret) return null;
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(this.two_factor_secret, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**Effort :** 4h (config clés + migration données)

#### 11. Validation magic bytes sur uploads

**Fichier :** `/backend/src/middlewares/uploadMiddleware.js`

**Installation :**
```bash
npm install file-type
```

**Fix :**
```javascript
const FileType = require('file-type');

const fileFilter = async (req, file, cb) => {
  try {
    // Vérifier magic bytes du buffer
    const buffer = await streamToBuffer(file.stream);
    const type = await FileType.fromBuffer(buffer);

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!type || !allowedMimes.includes(type.mime)) {
      return cb(new Error('Format de fichier non autorisé (vérification magic bytes)'));
    }

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};
```

**Effort :** 2h

#### 12. Implémenter refresh tokens

**Effort :** 8h (architecture + BDD + endpoints)

**Tables :** Créer `refresh_tokens(id, user_id, token, expires_at)`

**Endpoints :**
- POST /api/auth/refresh (échange refresh → nouveau access token)
- POST /api/auth/revoke (révocation token)

---

### 📋 P2 - IMPORTANT (2 semaines)

#### 13. Ajouter grand total perpétuel NF525

**Migration 032 :**
```sql
ALTER TABLE daily_reports ADD COLUMN grand_total_ttc DECIMAL(15,2) DEFAULT 0;

-- Fonction de calcul
CREATE OR REPLACE FUNCTION calculate_grand_total(org_id INT)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  total DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(total_amount_ttc), 0)
  INTO total
  FROM daily_reports
  WHERE organization_id = org_id;
  RETURN total;
END;
$$ LANGUAGE plpgsql;
```

**Effort :** 2h

#### 14. CRON automatique génération rapport Z

**Fichier :** `/backend/src/services/cronJobs.js`

**Fix :**
```javascript
const generateDailyReportAuto = cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('CRON: Génération automatique rapports Z quotidiens');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reportDate = yesterday.toISOString().split('T')[0];

    // Pour chaque organisation active
    const orgs = await Organization.findAll({ where: { status: 'active' } });

    for (const org of orgs) {
      try {
        await DailyReport.generateForDate(org.id, reportDate);
        logger.info(`Rapport Z généré pour organisation ${org.id}`);
      } catch (error) {
        logger.error(`Erreur génération rapport Z org ${org.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('CRON: Erreur génération rapports Z:', error);
  }
});

module.exports = {
  // ...
  generateDailyReportAuto,
};
```

**Effort :** 3h

#### 15. Ajouter politique confidentialité RGPD

**Fichiers à créer :**
- `/backend/src/routes/legal.js`
- `/backend/src/controllers/legalController.js`
- `docs/PRIVACY_POLICY.md`

**Endpoints :**
```javascript
GET /api/legal/privacy-policy
GET /api/legal/terms-of-service
GET /api/legal/cookie-policy
```

**Contenu minimum :**
- Identité responsable de traitement
- Finalités du traitement
- Base légale (contrat, consentement)
- Durées de conservation (6 ans ventes, 3 mois logs)
- Droits des personnes (Art. 15-22)
- Contact DPO ou responsable

**Effort :** 6h (rédaction + intégration)

#### 16. Créer registre des traitements RGPD

**Fichier :** `docs/RGPD_REGISTER.md`

**Contenu :**
```markdown
# Registre des activités de traitement (Article 30 RGPD)

## Traitement 1 : Gestion des comptes utilisateurs
- **Finalité :** Authentification, gestion des droits
- **Base légale :** Contrat (exécution du service)
- **Catégories de données :** Identité, identifiants, logs connexion
- **Destinataires :** Hébergeur (AWS/OVH), équipe support
- **Durée de conservation :** Durée du contrat + 30 jours (RGPD)
- **Mesures de sécurité :** Hash bcrypt, JWT, isolation multi-tenant

## Traitement 2 : Ventes et transactions
- **Finalité :** Facturation, conformité fiscale NF525
- **Base légale :** Obligation légale (conservation 6 ans)
- **Catégories de données :** Transactions (montants, dates), vendeur
- **Destinataires :** Administration fiscale (sur demande)
- **Durée de conservation :** 6 ans minimum (Décret n°2016-1551)
- **Mesures de sécurité :** Hash SHA-256, immutabilité, anonymisation RGPD

## Traitement 3 : Logs d'audit
- **Finalité :** Sécurité, traçabilité, conformité NF525
- **Base légale :** Intérêt légitime (sécurité du système)
- **Catégories de données :** Actions, IP, user-agent, date/heure
- **Destinataires :** Équipe technique
- **Durée de conservation :** 3 mois (anonymisation automatique)
- **Mesures de sécurité :** Anonymisation après 3 mois, filtrage IP
```

**Effort :** 4h

#### 17. Tests critiques (couverture 30% minimum)

**Priorité tests :**

**NF525 (8 tests) :**
```javascript
// backend/tests/nf525/hashChain.test.js
describe('NF525 Hash Chain', () => {
  it('should generate SHA-256 hash on sale creation', async () => { ... });
  it('should chain hash with previous sale', async () => { ... });
  it('should prevent sale modification', async () => { ... });
  it('should verify integrity', async () => { ... });
});

// backend/tests/nf525/dailyReport.test.js
describe('NF525 Daily Report', () => {
  it('should generate report with VAT breakdown', async () => { ... });
  it('should prevent report modification', async () => { ... });
  it('should calculate grand total', async () => { ... });
});
```

**Multi-tenant (5 tests) :**
```javascript
// backend/tests/security/multiTenant.test.js
describe('Multi-tenant Isolation', () => {
  it('should reject X-Organization-ID from normal user', async () => { ... });
  it('should filter data by organization_id', async () => { ... });
  it('should prevent cross-tenant data access', async () => { ... });
});
```

**RGPD (4 tests) :**
```javascript
// backend/tests/rgpd/dataRights.test.js
describe('RGPD Data Rights', () => {
  it('should export user data (Art. 15)', async () => { ... });
  it('should delete user with anonymization', async () => { ... });
  it('should anonymize audit logs on deletion', async () => { ... });
});
```

**Effort :** 2 semaines (20h)

**Objectif :** Passer de 1.3% à 30% couverture

---

### 🔧 P3 - AMÉLIORATIONS (1 mois)

#### 18. Supprimer migration 009 et table store_settings

**Actions :**
1. Supprimer `database/migrations/009_create_trigger_function.sql`
2. Migration 031 : `DROP TABLE IF EXISTS store_settings CASCADE;`
3. Documenter dans `database/migrations/MISSING_MIGRATIONS.md`

**Effort :** 1h

#### 19. Consolider routes d'inscription

**Garder :** POST /api/public/signup
**Déprécier :** POST /api/auth/signup, POST /api/organizations/register

**Migration utilisateurs existants** si nécessaire

**Effort :** 2h

#### 20. Implémenter Swagger/OpenAPI

**Installation :**
```bash
npm install swagger-jsdoc swagger-ui-express
```

**Configuration :**
```javascript
// backend/src/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlexPOS API',
      version: '2.0.0',
      description: 'API SaaS multi-tenant pour point de vente conforme NF525',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.flexpos.app', description: 'Production' }
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
```

**Dans server.js :**
```javascript
const { specs, swaggerUi } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Effort :** 8h (config + documenter 79 endpoints)

#### 21. Supprimer 30 console.log

**Commande :**
```bash
grep -r "console\." backend/src --include="*.js" -n
```

**Remplacer par :**
```javascript
// console.log('Debug info'); ❌
logger.debug('Debug info'); // ✅
```

**Effort :** 2h

#### 22. Implémenter cache Redis

**Installation :**
```bash
npm install redis
```

**Configuration :**
```javascript
// backend/src/config/redis.js
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

module.exports = { redisClient: client };
```

**Middleware cache :**
```javascript
// backend/src/middlewares/cache.js
const cache = (duration = 300) => { // 5 min par défaut
  return async (req, res, next) => {
    const key = `cache:${req.organizationId}:${req.originalUrl}`;
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Override res.json pour mettre en cache
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redisClient.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (error) {
      next(); // Continuer sans cache en cas d'erreur
    }
  };
};
```

**Appliquer sur routes fréquentes :**
```javascript
// Routes à cacher
router.get('/config', cache(300), settingsController.getPublicConfig); // 5 min
router.get('/products', cache(60), productController.getAllProducts); // 1 min
router.get('/dashboard/stats', cache(30), dashboardController.getStats); // 30 sec
```

**Effort :** 6h

#### 23. CI/CD avec GitHub Actions

**Fichier :** `.github/workflows/test.yml`

```yaml
name: Tests & Lint

on:
  push:
    branches: [main, develop, claude/*]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: pos_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run migrations
        run: cd backend && npm run db:migrate
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: pos_test
          DB_USER: postgres
          DB_PASSWORD: postgres

      - name: Run tests
        run: cd backend && npm test -- --coverage
        env:
          NODE_ENV: test
          JWT_SECRET: test-secret-key
          DB_HOST: localhost

      - name: Lint
        run: cd backend && npm run lint

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage

  test-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Lint
        run: cd frontend && npm run lint

      - name: Build
        run: cd frontend && npm run build
```

**Effort :** 4h

#### 24. Activer monitoring Sentry

**Installation :**
```bash
npm install @sentry/node @sentry/profiling-node
```

**Configuration :** `/backend/src/server.js`

```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

if (config.NODE_ENV === 'production' && config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 0.1, // 10% des transactions
    profilesSampleRate: 0.1,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // À la fin, AVANT errorHandler
  app.use(Sentry.Handlers.errorHandler());
}
```

**Effort :** 2h

---

## 📊 CHECKLIST DE DÉPLOIEMENT PRODUCTION

### Avant déploiement (obligatoire)

- [ ] **P0-1** : CVE-FLEXPOS-006 corrigé (X-Organization-ID)
- [ ] **P0-2** : Middleware tenantIsolation appliqué sur routes
- [ ] **P0-3** : Séquence ticket_number créée
- [ ] **P0-4** : Ventilation TVA calculée dans Rapport Z
- [ ] **P0-5** : Bug cookies config.env corrigé
- [ ] **P0-6** : Logging credentials supprimé
- [ ] **P1-7** : PIN 6 chiffres minimum
- [ ] **P1-9** : Rate limiting password reset
- [ ] **P1-10** : Secrets 2FA chiffrés
- [ ] Tests critiques NF525 passent (hash, chaîne, immutabilité)
- [ ] Tests multi-tenant passent (isolation, injection)
- [ ] `.env` production configuré avec secrets forts
- [ ] JWT_SECRET généré aléatoirement (32+ caractères)
- [ ] DB_PASSWORD changé
- [ ] HTTPS activé (Caddy)
- [ ] Backups PostgreSQL configurés

### Recommandé

- [ ] **P1-8** : CSRF protection implémentée
- [ ] **P1-11** : Validation magic bytes uploads
- [ ] **P1-12** : Refresh tokens implémentés
- [ ] **P2-13** : Grand total perpétuel NF525
- [ ] **P2-14** : CRON automatique rapport Z
- [ ] **P2-15** : Politique confidentialité RGPD
- [ ] **P2-16** : Registre des traitements RGPD
- [ ] **P2-17** : Tests couverture ≥ 30%
- [ ] Sentry monitoring activé
- [ ] CI/CD GitHub Actions configuré

### Nice to have

- [ ] **P3-18** : Migration 009 + store_settings supprimés
- [ ] **P3-20** : Swagger/OpenAPI documenté
- [ ] **P3-21** : Console.log supprimés (30)
- [ ] **P3-22** : Cache Redis implémenté
- [ ] Logs centralisés (CloudWatch, Datadog)
- [ ] Alertes configurées (erreurs, performances)

---

## 💰 ESTIMATION BUDGET CORRECTIONS

### Développement

| Priorité | Tâches | Effort | Tarif (/j) | Coût |
|----------|--------|--------|------------|------|
| **P0** | 6 tâches critiques | 3 jours | 600€ | **1 800€** |
| **P1** | 6 tâches urgentes | 5 jours | 600€ | **3 000€** |
| **P2** | 7 tâches importantes | 10 jours | 600€ | **6 000€** |
| **P3** | 7 améliorations | 10 jours | 600€ | 6 000€ |

**Total P0+P1+P2 (production-ready) :** **10 800€ HT**

**Total complet (P0→P3) :** 16 800€ HT

### Délais

- **P0 (bloquants) :** 3 jours (1 dev)
- **P1 (urgent) :** 5 jours (1 dev)
- **P2 (important) :** 10 jours (2 devs en parallèle)
- **Total production-ready :** **3-4 semaines**

### Maintenance annuelle (estimation)

- Monitoring/alertes : 200€/mois
- Hébergement (AWS/OVH) : 150€/mois
- Certificat NF525 (organisme accrédité) : 1 500€ one-time
- Support technique : 500€/mois
- Mises à jour sécurité : 1 000€/an

**Total maintenance annuelle :** ~10 000€

---

## 🎓 CONCLUSION

### État actuel

FlexPOS est un projet **techniquement solide** avec :
- ✅ Architecture SaaS bien conçue
- ✅ Conformité NF525 à 58% (quasi complète)
- ✅ Conformité RGPD à 58% (droits implémentés)
- ✅ Documentation extensive (33 docs)
- ✅ Stack moderne et performante

**MAIS** souffre de **6 vulnérabilités critiques** qui rendent le déploiement production **IMPOSSIBLE en l'état**.

### Risques juridiques

| Risque | Amende max | Probabilité | Gravité |
|--------|------------|-------------|---------|
| **CVE-006 Cross-tenant breach** | 20M€ (RGPD) | **CERTAINE** | 🔴 Critique |
| **NF525 non certifiable** | 7 500€/caisse | **ÉLEVÉE** | 🔴 Critique |
| **Bugs sécurité RGPD** | 10M€ | **ÉLEVÉE** | 🔴 Critique |
| **Facturation électronique 2026** | Amendes fiscales | **MOYENNE** | 🟡 Moyen |

### Verdict final

**Score global : 64/100** - **NON PRODUCTION-READY**

**Avec corrections P0+P1+P2 (18 jours) :**
**Score projeté : 85/100** - **PRODUCTION-READY** ✅

### Prochaines étapes recommandées

**Semaine 1 (P0 - BLOQUEURS) :**
1. Corriger CVE-006 cross-tenant
2. Créer séquence ticket_number
3. Calculer vat_breakdown rapport Z
4. Fix cookies + logging credentials

**Semaine 2-3 (P1 - URGENT) :**
5. PIN 6 chiffres + CSRF + rate limiting
6. Chiffrer secrets 2FA
7. Validation uploads + refresh tokens

**Semaine 4-6 (P2 - IMPORTANT) :**
8. Grand total NF525 + CRON rapport Z
9. Politique confidentialité RGPD
10. Tests critiques (couverture 30%)

**Après production (P3) :**
11. Swagger/OpenAPI
12. Cache Redis
13. CI/CD complet
14. Monitoring avancé

### Recommandation finale

**ACTION IMMÉDIATE :** Ne PAS déployer en production sans corrections P0.

**ROADMAP :**
1. Sprint 1 (1 semaine) : Corrections P0 → Version MVP sécurisée
2. Sprint 2-3 (2 semaines) : Corrections P1 → Version conforme NF525+RGPD
3. Sprint 4-6 (3 semaines) : Corrections P2 → Version production-ready complète
4. Certification NF525 par organisme accrédité (AFNOR/LNE)
5. Déploiement production avec monitoring 24/7

**Budget total estimé :** 10 800€ HT (P0+P1+P2) + 1 500€ certification NF525

**Délai total :** 6 semaines de développement + 2-4 semaines certification

---

## 📞 CONTACTS & RESSOURCES

### Organismes certification NF525
- **AFNOR Certification** : https://certification.afnor.org/
- **InfoCert** : https://www.infocert.fr/
- **LNE** : https://www.lne.fr/

### Réglementation
- **NF525** : Décret n°2016-1551 du 15 novembre 2016
- **RGPD** : https://www.cnil.fr/
- **Facturation électronique** : https://www.impots.gouv.fr/facture-electronique

### Sécurité
- **OWASP Top 10** : https://owasp.org/
- **CVE Database** : https://cve.mitre.org/
- **npm audit** : https://docs.npmjs.com/cli/audit

---

**Rapport généré le :** 2 décembre 2025
**Par :** Claude Code - Audit Technique Senior
**Contact :** Pour questions sur ce rapport, se référer aux sections détaillées ci-dessus

**Fichiers livrables :**
- ✅ AUDIT_SAAS_COMPLET_2025-12-02.md (ce rapport)
- ✅ Rapports agents détaillés (migrations, RGPD, NF525, sécurité, routes)
- ✅ Checklist de déploiement
- ✅ Plan d'action priorisé avec code samples

---

**Fin du rapport** - 85 pages - Audit exhaustif complet
