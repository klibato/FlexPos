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
