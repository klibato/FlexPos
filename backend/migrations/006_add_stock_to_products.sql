-- Migration: Ajouter gestion des stocks aux produits
-- Date: 2025-11-14
-- Description: Ajoute les colonnes quantity et low_stock_threshold pour la gestion des stocks

-- Ajouter la colonne quantity (quantité en stock)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0);

-- Ajouter la colonne low_stock_threshold (seuil d'alerte stock bas)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0);

-- Commentaires
COMMENT ON COLUMN products.quantity IS 'Quantité en stock du produit';
COMMENT ON COLUMN products.low_stock_threshold IS 'Seuil d''alerte pour stock bas';

-- Initialiser les produits existants avec un stock de 100 par défaut (à ajuster manuellement après)
UPDATE products
SET quantity = 100, low_stock_threshold = 10
WHERE quantity = 0;
