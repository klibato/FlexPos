# 🎯 PLAN D'ATTAQUE 6 SEMAINES - FLEXPOS PRODUCTION-READY

**Objectif :** Passer de **64/100** à **85/100** et rendre FlexPOS **production-ready**

**Budget total :** 10 800€ HT (P0+P1+P2)
**Délai total :** 6 semaines
**Équipe recommandée :** 1-2 développeurs backend + 1 testeur

---

## 📅 ROADMAP GLOBALE

| Semaine | Phase | Focus | Livrables | Budget |
|---------|-------|-------|-----------|--------|
| **S1** | P0 | 🚨 Bloqueurs critiques | 6 CVE fixes + tests | 1 800€ |
| **S2** | P1a | 🔐 Sécurité urgente | PIN 6, CSRF, rate limit | 1 500€ |
| **S3** | P1b | 🔐 Sécurité suite | 2FA, uploads, refresh tokens | 1 500€ |
| **S4** | P2a | 📜 NF525 + Tests | Grand total, CRON, 20 tests | 3 000€ |
| **S5** | P2b | 👤 RGPD + Docs | Politique, registre, consentement | 1 500€ |
| **S6** | P2c | ✅ Finition + Cert | Swagger, CI/CD, dossier NF525 | 1 500€ |

**Total :** 10 800€ HT

---

## 📆 SEMAINE 1 (3 jours) - P0 BLOQUEURS CRITIQUES

**Objectif :** Corriger les 6 CVE bloquants production

### Jour 1 - Lundi (8h)

#### Matin (4h)
- [ ] **09:00-09:30** - Setup environnement + backup BDD
- [ ] **09:30-10:00** - FIX 1 : CVE-006 Cross-tenant (tenantIsolation.js)
- [ ] **10:00-12:00** - FIX 2 : Appliquer tenantIsolation sur 14 routes
- [ ] **12:00-13:00** - Tests manuels CVE-006

#### Après-midi (4h)
- [ ] **14:00-14:30** - FIX 5 : Bug cookies config.env
- [ ] **14:30-15:00** - FIX 3 : Migration 031 séquence ticket_number
- [ ] **15:00-17:00** - FIX 4 : Calcul vat_breakdown Rapport Z
- [ ] **17:00-18:00** - Tests création vente + rapport Z

**Livrables J1 :**
- ✅ CVE-006 corrigé (cross-tenant sécurisé)
- ✅ tenantIsolation appliqué partout
- ✅ Ventes fonctionnelles (séquence ticket_number OK)
- ✅ Rapport Z conforme NF525 (vat_breakdown calculé)

### Jour 2 - Mardi (8h)

#### Matin (4h)
- [ ] **09:00-10:00** - FIX 6 : Supprimer logging credentials (6 fichiers)
- [ ] **10:00-10:30** - Nettoyer logs existants (production)
- [ ] **10:30-12:30** - Tests E2E complets (vente → rapport Z)

#### Après-midi (4h)
- [ ] **14:00-16:00** - Tests multi-tenant isolation (5 scénarios)
- [ ] **16:00-17:30** - Tests sécurité (injection, XSS, CSRF basique)
- [ ] **17:30-18:00** - Code review pair programming

**Livrables J2 :**
- ✅ Aucune credential dans les logs
- ✅ 5 tests multi-tenant passent (100%)
- ✅ Tests sécurité basiques OK

### Jour 3 - Mercredi (4h)

#### Matin (4h)
- [ ] **09:00-11:00** - Tests de charge (100 ventes simultanées)
- [ ] **11:00-12:00** - Scan sécurité automatique (OWASP ZAP)
- [ ] **12:00-13:00** - Documentation des fixes (CHANGELOG.md)

#### Après-midi - Optionnel
- [ ] Déploiement staging pour validation client
- [ ] Formation équipe sur les fixes

**Livrables S1 :**
- ✅ 6 CVE critiques corrigés
- ✅ Tests passent (multi-tenant + sécurité)
- ✅ Documentation à jour
- ✅ Staging déployé

**Budget S1 :** 1 800€ HT (3 jours × 600€)

---

## 📆 SEMAINE 2 (5 jours) - P1 SÉCURITÉ URGENTE (PARTIE 1)

**Objectif :** Renforcer auth + CSRF + rate limiting

### Lundi (8h)

#### PIN 6 chiffres minimum + Migration données
- [ ] **09:00-10:00** - Modifier validation User.js (4→6 chiffres)
- [ ] **10:00-11:00** - Modifier validation userController.js
- [ ] **11:00-12:00** - Créer migration 032 : ALTER users.pin_code
- [ ] **12:00-13:00** - Tests validation PIN

#### Après-midi
- [ ] **14:00-15:00** - Script migration PINs existants (padding 00)
- [ ] **15:00-16:00** - Notification users (email changement requis)
- [ ] **16:00-17:00** - Tests authentification avec PIN 6 chiffres
- [ ] **17:00-18:00** - Documentation utilisateur (comment changer PIN)

**Livrable :** ✅ PIN 6 chiffres obligatoire + users migrés

### Mardi (8h)

#### CSRF Protection
- [ ] **09:00-09:30** - Installation `npm install csurf`
- [ ] **09:30-11:00** - Configuration csurf dans server.js
- [ ] **11:00-12:00** - Endpoint GET /api/csrf-token
- [ ] **12:00-13:00** - Tests backend CSRF

#### Après-midi
- [ ] **14:00-16:00** - Intégration frontend (Axios interceptor)
- [ ] **16:00-17:00** - Tests E2E avec CSRF token
- [ ] **17:00-18:00** - Documentation API (header X-CSRF-Token)

**Livrable :** ✅ CSRF protection complète (backend + frontend)

### Mercredi (8h)

#### Rate Limiting password reset
- [ ] **09:00-09:30** - Créer resetLimiter (3/heure)
- [ ] **09:30-10:00** - Appliquer sur /admin/auth/password-reset
- [ ] **10:00-11:00** - Tests rate limiting (4 requêtes → 4ème bloquée)
- [ ] **11:00-12:00** - Message d'erreur user-friendly

#### Après-midi - Admin password policy
- [ ] **14:00-15:00** - Validation password 12 caractères min
- [ ] **15:00-16:00** - Complexité (maj + min + chiffre + symbole)
- [ ] **16:00-17:00** - Tests validation password
- [ ] **17:00-18:00** - Documentation politique mots de passe

**Livrable :** ✅ Rate limiting + password policy renforcée

### Jeudi (8h)

#### Blocage compte après 5 échecs
- [ ] **09:00-10:00** - Ajouter champ users.failed_login_attempts
- [ ] **10:00-11:00** - Ajouter champ users.locked_until
- [ ] **11:00-12:30** - Logique lock/unlock dans authController
- [ ] **12:30-13:00** - Tests blocage après 5 échecs

#### Après-midi - CAPTCHA après 3 échecs
- [ ] **14:00-15:30** - Intégration hCaptcha ou reCAPTCHA
- [ ] **15:30-17:00** - Tests brute-force avec CAPTCHA
- [ ] **17:00-18:00** - Documentation sécurité auth

**Livrable :** ✅ Protection brute-force complète

### Vendredi (4h) - Consolidation

- [ ] **09:00-11:00** - Tests complets sécurité auth
- [ ] **11:00-12:00** - Code review + refactoring
- [ ] **12:00-13:00** - Documentation semaine 2

**Livrables S2 :**
- ✅ PIN 6 chiffres
- ✅ CSRF protection
- ✅ Rate limiting password reset
- ✅ Blocage compte + CAPTCHA
- ✅ Password policy renforcée

**Budget S2 :** 1 500€ HT (5 jours × 300€)

---

## 📆 SEMAINE 3 (5 jours) - P1 SÉCURITÉ (PARTIE 2)

**Objectif :** 2FA chiffré + uploads sécurisés + refresh tokens

### Lundi (8h)

#### Chiffrement secrets 2FA (AES-256)
- [ ] **09:00-10:00** - Générer ENCRYPTION_KEY (env var)
- [ ] **10:00-12:00** - Hooks beforeCreate/afterFind AdminUser.js
- [ ] **12:00-13:00** - Tests chiffrement/déchiffrement

#### Après-midi - Migration données existantes
- [ ] **14:00-16:00** - Script migration secrets 2FA existants
- [ ] **16:00-17:00** - Tests 2FA avec secrets chiffrés
- [ ] **17:00-18:00** - Documentation clés encryption

**Livrable :** ✅ Secrets 2FA chiffrés en base

### Mardi (8h)

#### Validation magic bytes uploads
- [ ] **09:00-09:30** - Installation `npm install file-type`
- [ ] **09:30-11:00** - Modifier uploadMiddleware.js (magic bytes)
- [ ] **11:00-12:00** - Tests upload images valides
- [ ] **12:00-13:00** - Tests rejection fichiers malveillants

#### Après-midi - Scan antivirus ClamAV
- [ ] **14:00-15:00** - Installation ClamAV (Docker service)
- [ ] **15:00-16:30** - Intégration scan dans uploadMiddleware
- [ ] **16:30-17:30** - Tests avec fichier infecté EICAR
- [ ] **17:30-18:00** - Documentation upload sécurisé

**Livrable :** ✅ Uploads sécurisés (magic bytes + ClamAV)

### Mercredi-Jeudi (16h)

#### Refresh Tokens JWT
- [ ] **Mercredi matin** - Table refresh_tokens (migration 033)
- [ ] **Mercredi AM** - Modèle RefreshToken.js + relations
- [ ] **Jeudi matin** - Endpoint POST /api/auth/refresh
- [ ] **Jeudi AM** - Endpoint POST /api/auth/revoke
- [ ] **Jeudi PM** - Tests refresh token flow
- [ ] **Jeudi soir** - Intégration frontend (auto-refresh)

**Livrable :** ✅ Refresh tokens avec rotation

### Vendredi (4h)

#### Redaction automatique logs
- [ ] **09:00-10:00** - Installation `npm install fast-redact`
- [ ] **10:00-11:00** - Configuration Winston avec redaction
- [ ] **11:00-12:00** - Tests logs (pas de fuites credentials)
- [ ] **12:00-13:00** - Documentation + review semaine

**Livrables S3 :**
- ✅ Secrets 2FA chiffrés AES-256
- ✅ Uploads validation magic bytes + ClamAV
- ✅ Refresh tokens JWT fonctionnels
- ✅ Redaction automatique logs

**Budget S3 :** 1 500€ HT

---

## 📆 SEMAINE 4 (10 jours / 2 devs) - P2 NF525 + TESTS

**Objectif :** Compléter NF525 + 30% couverture tests

### Lundi-Mardi (Dev 1)

#### Grand Total Perpétuel NF525
- [ ] Migration 034 : ADD COLUMN grand_total_ttc
- [ ] Fonction SQL calculate_grand_total(org_id)
- [ ] Modifier DailyReport.generateForDate() (calcul auto)
- [ ] Tests grand total sur 3 jours consécutifs

**Livrable :** ✅ Grand total perpétuel fonctionnel

### Lundi-Mardi (Dev 2)

#### CRON automatique rapport Z
- [ ] Fonction generateDailyReportAuto() dans cronJobs.js
- [ ] Schedule cron '0 0 * * *' (minuit)
- [ ] Boucle sur organizations actives
- [ ] Gestion erreurs + notifications
- [ ] Tests CRON (exécution manuelle)

**Livrable :** ✅ CRON génération rapport Z automatique

### Mercredi-Jeudi (Dev 1 + Dev 2)

#### Tests NF525 (20 tests)
- [ ] **Tests hash chain** (8 tests)
  - Génération hash SHA-256
  - Chaînage previous_hash
  - Immutabilité ventes (beforeUpdate bloqué)
  - Vérification intégrité chaîne
  - Séquence continue
  - Thread-safety
  - Race condition (2 ventes simultanées)
  - Détection altération

- [ ] **Tests rapport Z** (6 tests)
  - Génération rapport avec vat_breakdown
  - Grand total perpétuel calculé
  - Immutabilité rapport (beforeUpdate bloqué)
  - Signature hash correcte
  - Pas de doublons (même date)
  - Export fiscal (JSON + CSV)

- [ ] **Tests multi-tenant** (6 tests)
  - Injection X-Organization-ID rejetée
  - Filtrage organization_id systématique
  - Isolation données entre tenants
  - Super-admin access loggé
  - Export données filtrées
  - Suppression tenant (cascade)

**Livrable :** ✅ 20 tests NF525/multi-tenant (couverture +15%)

### Vendredi (Dev 1 + Dev 2)

#### Tests RGPD (4 tests)
- [ ] Export données personnelles (Art. 15)
- [ ] Suppression avec anonymisation
- [ ] CRON suppression après 30j
- [ ] Anonymisation audit_logs

#### Tests sécurité (6 tests)
- [ ] Rate limiting (login + password reset)
- [ ] JWT expiration + refresh
- [ ] RBAC permissions (admin/cashier/super-admin)
- [ ] Upload validation (magic bytes + taille)
- [ ] CSRF protection
- [ ] Blocage compte après 5 échecs

**Livrables S4 :**
- ✅ Grand total perpétuel NF525
- ✅ CRON automatique rapport Z
- ✅ 30 tests unitaires + intégration
- ✅ Couverture tests : 1.3% → 30%
- ✅ Score NF525 : 7/12 → 10/12 (83%)

**Budget S4 :** 3 000€ HT (10 jours × 300€)

---

## 📆 SEMAINE 5 (5 jours) - P2 RGPD + DOCUMENTATION

**Objectif :** Conformité RGPD complète + documentation légale

### Lundi-Mardi (8h+8h)

#### Politique de confidentialité RGPD
- [ ] Rédaction PRIVACY_POLICY.md (Art. 13-14)
  - Identité responsable traitement
  - Finalités (auth, ventes, analytics)
  - Base légale (contrat, légale, légitime)
  - Durées conservation (6 ans ventes, 3 mois logs)
  - Droits personnes (accès, rectification, effacement)
  - Contact DPO / responsable
  - Transferts hors UE (si applicable)

- [ ] Routes légales (legalController.js)
  - GET /api/legal/privacy-policy
  - GET /api/legal/terms-of-service
  - GET /api/legal/cookie-policy

- [ ] Intégration frontend (bandeau cookies + liens)

**Livrable :** ✅ Politique confidentialité complète + accessible

### Mercredi (8h)

#### Registre des traitements (Art. 30 RGPD)
- [ ] Création RGPD_REGISTER.md
- [ ] Traitement 1 : Gestion comptes utilisateurs
- [ ] Traitement 2 : Ventes et transactions
- [ ] Traitement 3 : Logs d'audit
- [ ] Traitement 4 : Analytics dashboard
- [ ] Traitement 5 : Emails marketing (si applicable)

**Livrable :** ✅ Registre des traitements RGPD conforme

### Jeudi (8h)

#### Gestion du consentement
- [ ] Migration 035 : Table user_consents
- [ ] Modèle UserConsent.js
- [ ] Checkbox consentement signup
- [ ] Versioning politique confidentialité
- [ ] Endpoint retrait consentement

**Livrable :** ✅ Consentement explicite tracé

### Vendredi (4h)

#### Amélioration admin_users RGPD
- [ ] Ajouter champ deletion_requested_at
- [ ] Étendre CRON suppression aux AdminUser
- [ ] Endpoint DELETE /api/admin/me/account
- [ ] Tests suppression admin

**Livrables S5 :**
- ✅ Politique confidentialité + CGU + cookies
- ✅ Registre des traitements RGPD
- ✅ Consentement explicite + retrait
- ✅ AdminUser RGPD complet
- ✅ Score RGPD : 7.5/13 → 11/13 (85%)

**Budget S5 :** 1 500€ HT

---

## 📆 SEMAINE 6 (5 jours) - P2 FINITION + CERTIFICATION

**Objectif :** Swagger + CI/CD + Dossier certification NF525

### Lundi-Mardi (16h)

#### Swagger/OpenAPI documentation
- [ ] Installation swagger-jsdoc + swagger-ui-express
- [ ] Configuration swagger.js
- [ ] Route /api-docs
- [ ] Documenter 79 endpoints (JSDoc)
  - Auth (8)
  - Users (7)
  - Products (10)
  - Sales (5)
  - Cash Registers (6)
  - Dashboard (2)
  - Settings (3)
  - Logs (3)
  - Printer (4)
  - NF525 (3)
  - Daily Reports (5)
  - Organizations (5)
  - Admin (16)
  - Public (2)

**Livrable :** ✅ API documentée Swagger (79 endpoints)

### Mercredi (8h)

#### CI/CD GitHub Actions
- [ ] .github/workflows/test.yml (backend)
- [ ] .github/workflows/test-frontend.yml
- [ ] Tests automatiques sur PR
- [ ] Linting automatique (ESLint)
- [ ] Coverage upload (Codecov)
- [ ] Badge README.md

**Livrable :** ✅ CI/CD complet avec tests auto

### Jeudi (8h)

#### Monitoring & observabilité
- [ ] Activation Sentry (SENTRY_DSN)
- [ ] Configuration profiling
- [ ] Tests alertes erreurs
- [ ] Dashboard Sentry configuré

#### Cache Redis (si temps)
- [ ] Installation Redis (Docker)
- [ ] Middleware cache
- [ ] Application sur routes fréquentes
- [ ] Tests performance

**Livrable :** ✅ Monitoring Sentry + cache Redis

### Vendredi (4h)

#### Dossier certification NF525
- [ ] Compilation documentation technique
  - Architecture système
  - Schéma BDD avec hash_chain
  - Code source nf525Service.js
  - Tests NF525 (rapport)
  - Procédure génération rapport Z
  - Procédure vérification intégrité

- [ ] Remplir formulaire AFNOR
- [ ] Captures d'écran interface
- [ ] Vidéo démo (5 min)

**Livrable :** ✅ Dossier certification NF525 complet

**Livrables S6 :**
- ✅ Swagger API documentation
- ✅ CI/CD GitHub Actions
- ✅ Monitoring Sentry
- ✅ Cache Redis (optionnel)
- ✅ Dossier certification NF525 prêt

**Budget S6 :** 1 500€ HT

---

## 🎯 RÉCAPITULATIF FINAL

### Scores projetés

| Métrique | Avant | Après 6 semaines | Amélioration |
|----------|-------|------------------|--------------|
| **Score global** | 64/100 | **85/100** | +21 points |
| **Sécurité** | 6.2/10 | **8.5/10** | +2.3 |
| **Multi-tenant** | 3/10 | **9/10** | +6 |
| **NF525** | 7/12 (58%) | **10/12 (83%)** | +3 (25%) |
| **RGPD** | 7.5/13 (58%) | **11/13 (85%)** | +3.5 (27%) |
| **Tests** | 2/10 | **7/10** | +5 |
| **CVE critiques** | 6 | **0** | -6 ✅ |
| **Couverture tests** | 1.3% | **30%** | +28.7% |

### Livrables totaux

- ✅ 6 CVE critiques corrigés
- ✅ 30 tests unitaires + intégration
- ✅ Politique confidentialité RGPD
- ✅ Registre des traitements
- ✅ Swagger API (79 endpoints)
- ✅ CI/CD GitHub Actions
- ✅ Monitoring Sentry
- ✅ Dossier certification NF525

### Budget & ROI

**Investissement total :** 10 800€ HT + 1 500€ certification = **12 300€ HT**

**ROI :**
- Éviter amende RGPD (jusqu'à 20M€)
- Éviter amende NF525 (7 500€/caisse × N caisses)
- Application production-ready (acquisition clients)
- Certification NF525 (argument commercial)
- Réduction risques juridiques

**Estimation économie :** Minimum 50 000€ (amendes évitées + CA généré)

**ROI :** 400% (50k€ / 12.3k€)

---

## ✅ CHECKLIST VALIDATION

### Après semaine 1 (P0)
- [ ] Aucun CVE critique détecté (scan OWASP ZAP)
- [ ] Tests multi-tenant passent (5/5)
- [ ] Ventes créables sans erreur PostgreSQL
- [ ] Rapport Z avec vat_breakdown complet
- [ ] Aucune credential dans logs

### Après semaine 3 (P1)
- [ ] PIN 6 chiffres obligatoire
- [ ] CSRF protection active
- [ ] Refresh tokens fonctionnels
- [ ] Secrets 2FA chiffrés
- [ ] Uploads sécurisés (magic bytes + ClamAV)

### Après semaine 6 (P2)
- [ ] Couverture tests ≥ 30%
- [ ] Score NF525 ≥ 10/12
- [ ] Score RGPD ≥ 11/13
- [ ] Politique confidentialité publiée
- [ ] Swagger /api-docs accessible
- [ ] CI/CD déclenché sur PR
- [ ] Dossier certification NF525 complet

---

## 🚀 CERTIFICATION NF525 (SEMAINE 7-8)

**Après P2 terminé :**

### Semaine 7
- [ ] Soumettre dossier à AFNOR Certification
- [ ] Payer frais certification (1 500€)
- [ ] Audit initial par organisme

### Semaine 8
- [ ] Corrections mineures si demandées
- [ ] Audit final
- [ ] Obtention certificat NF525

**Délai total avec certification :** 8 semaines

---

## 📊 MÉTRIQUES DE SUIVI

### KPIs hebdomadaires

| Semaine | CVE résolus | Tests ajoutés | Score NF525 | Score RGPD | Budget dépensé |
|---------|-------------|---------------|-------------|------------|----------------|
| S1 | 6/6 | 5 | 8/12 | 8/13 | 1 800€ |
| S2 | - | 3 | 8/12 | 9/13 | 3 300€ |
| S3 | - | 2 | 8/12 | 9/13 | 4 800€ |
| S4 | - | 20 | 10/12 | 10/13 | 7 800€ |
| S5 | - | 4 | 10/12 | 11/13 | 9 300€ |
| S6 | - | 1 | 10/12 | 11/13 | 10 800€ |

---

## 🎯 VALIDATION REQUISE

**Avant de démarrer, confirmer :**

1. ✅ Budget de 10 800€ HT approuvé
2. ✅ Équipe disponible (1-2 devs × 6 semaines)
3. ✅ Environnement staging disponible
4. ✅ Accès production pour déploiements
5. ✅ Backup BDD avant modifications
6. ✅ Client informé des indisponibilités potentielles

---

**UNE FOIS CONFIRMÉ → Je commence les fixes immédiatement ! 🚀**

**Question :** Valides-tu ce plan d'attaque ? Modifications à apporter ?
