#!/bin/bash

###############################################################################
# SCRIPT REBRANDING: Ben's Burger → FlexPOS
# Date: 2025-11-17
# Description: Remplace toutes les occurrences du branding dans le codebase
###############################################################################

set -e  # Exit on error

echo "🎨 =================================================="
echo "   REBRANDING: Ben's Burger → FlexPOS"
echo "===================================================="
echo ""

cd /home/user/BENSBURGER

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de remplacement sécurisée
replace_in_files() {
  local old_pattern="$1"
  local new_pattern="$2"
  local description="$3"

  echo -e "${BLUE}🔍 Recherche: '$old_pattern' → '$new_pattern'${NC}"

  # Trouver et remplacer dans fichiers
  local count=0
  while IFS= read -r -d '' file; do
    if grep -q "$old_pattern" "$file" 2>/dev/null; then
      sed -i "s|$old_pattern|$new_pattern|g" "$file"
      echo -e "  ${GREEN}✓${NC} $file"
      ((count++))
    fi
  done < <(find . -type f \
    \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.sql" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/coverage/*" \
    -print0)

  echo -e "  ${YELLOW}→ $count fichiers modifiés${NC}"
  echo ""
}

echo -e "${YELLOW}📂 Répertoire de travail: $(pwd)${NC}"
echo ""

# 1. Remplacements texte exact (case-sensitive)
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 1/8: Texte 'Ben's Burger'${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "Ben's Burger" "FlexPOS" "Nom complet avec apostrophe"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 2/8: Texte 'BensBurger' (PascalCase)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "BensBurger" "FlexPOS" "PascalCase sans espace"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 3/8: Texte 'bensburger' (lowercase)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "bensburger" "flexpos" "Lowercase complet"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 4/8: Texte 'BENSBURGER' (UPPERCASE)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "BENSBURGER" "FLEXPOS" "Uppercase complet"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 5/8: Texte 'bens-burger' (kebab-case)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "bens-burger" "flexpos" "Kebab-case URLs"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 6/8: Texte 'bens_burger' (snake_case)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "bens_burger" "flexpos" "Snake case variables"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 7/8: Package names (bensburger-pos)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "bensburger-pos" "flexpos" "Noms de packages npm"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   ÉTAPE 8/8: Descriptions (système de caisse)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
replace_in_files "système de caisse BensBurger" "solution de caisse FlexPOS" "Descriptions FR"
replace_in_files "Système de caisse pour BensBurger" "FlexPOS - Solution de caisse moderne multi-tenant" "Descriptions longues"
replace_in_files "Backend API pour le système de caisse BensBurger" "FlexPOS - Backend API multi-tenant conforme NF525" "Description backend"
replace_in_files "Frontend React pour le système de caisse BensBurger" "FlexPOS - Interface React moderne" "Description frontend"

# Vérification finale
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}   VÉRIFICATION FINALE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

remaining_bens=$(grep -r "Ben's Burger" \
  --exclude-dir={node_modules,.git,dist,build,coverage} \
  --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.html" \
  . 2>/dev/null | wc -l)

remaining_bensburger=$(grep -ri "bensburger" \
  --exclude-dir={node_modules,.git,dist,build,coverage} \
  --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.html" \
  . 2>/dev/null | wc -l)

remaining_upper=$(grep -r "BENSBURGER" \
  --exclude-dir={node_modules,.git,dist,build,coverage} \
  --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.html" \
  . 2>/dev/null | wc -l)

total_remaining=$((remaining_bens + remaining_bensburger + remaining_upper))

echo -e "📊 Résultats:"
echo -e "  - 'Ben's Burger': ${RED}$remaining_bens${NC}"
echo -e "  - 'bensburger': ${RED}$remaining_bensburger${NC}"
echo -e "  - 'BENSBURGER': ${RED}$remaining_upper${NC}"
echo ""
echo -e "  ${YELLOW}TOTAL RESTANT: $total_remaining occurrences${NC}"
echo ""

if [ $total_remaining -eq 0 ]; then
  echo -e "${GREEN}✅ SUCCÈS COMPLET: Aucune occurrence restante !${NC}"
  echo -e "${GREEN}✅ Rebranding 'Ben's Burger' → 'FlexPOS' terminé avec succès${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️ ATTENTION: $total_remaining occurrences restantes détectées${NC}"
  echo ""
  echo -e "${YELLOW}Fichiers concernés:${NC}"
  grep -r "Ben's Burger\|bensburger\|BENSBURGER" \
    --exclude-dir={node_modules,.git,dist,build,coverage} \
    --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.html" \
    . -l 2>/dev/null | head -20
  echo ""
  echo -e "${YELLOW}💡 Vérifiez manuellement ces fichiers${NC}"
  exit 1
fi
