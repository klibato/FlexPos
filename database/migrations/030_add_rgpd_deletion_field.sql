-- ==============================================
-- Migration 030: Ajout champ RGPD deletion_requested_at
-- ==============================================
-- Description: Ajoute un champ pour gérer le droit à l'effacement (Article 17 RGPD)
--              Les comptes marqués pour suppression seront supprimés après 30 jours
-- Date: 2025-11-28
-- ==============================================

BEGIN;

-- Ajouter le champ deletion_requested_at à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP NULL DEFAULT NULL;

-- Créer un index pour optimiser la recherche des comptes à supprimer
CREATE INDEX IF NOT EXISTS idx_users_deletion_requested
ON users(deletion_requested_at)
WHERE deletion_requested_at IS NOT NULL;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN users.deletion_requested_at IS 'Date de demande de suppression du compte (RGPD Article 17). Les comptes sont supprimés 30 jours après cette date.';

COMMIT;

-- ==============================================
-- Vérification et rapport
-- ==============================================
DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Vérifier que la colonne a été créée
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'deletion_requested_at'
  ) INTO column_exists;

  -- Vérifier que l'index a été créé
  SELECT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'users'
    AND indexname = 'idx_users_deletion_requested'
  ) INTO index_exists;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 030 terminée avec succès';
  RAISE NOTICE '   - Colonne deletion_requested_at: %', CASE WHEN column_exists THEN 'CRÉÉE' ELSE 'ERREUR' END;
  RAISE NOTICE '   - Index idx_users_deletion_requested: %', CASE WHEN index_exists THEN 'CRÉÉ' ELSE 'ERREUR' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 RGPD Article 17 - Droit à l''effacement';
  RAISE NOTICE '   - Les utilisateurs peuvent demander la suppression';
  RAISE NOTICE '   - Les comptes sont supprimés 30 jours après la demande';
  RAISE NOTICE '   - CRON job exécuté quotidiennement à 3h du matin';
  RAISE NOTICE '========================================';
END $$;
