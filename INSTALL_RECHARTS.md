# Installation de recharts dans le conteneur Docker

## Problème
L'application tourne dans un conteneur Docker, mais recharts a été installé uniquement localement.
Le conteneur Docker ne voit pas le package, ce qui cause l'erreur d'import.

## Solution

### Option 1 : Installation directe dans le conteneur (RECOMMANDÉ)

```bash
# Trouver le nom du conteneur frontend
docker ps

# Installer recharts dans le conteneur
# Remplacez <container_name> par le nom réel du conteneur frontend
docker exec -it <container_name> npm install recharts

# Le serveur Vite se rechargera automatiquement
```

### Option 2 : Rebuild complet du conteneur

```bash
cd /home/user/BENSBURGER

# Arrêter les conteneurs
docker-compose down

# Rebuild et restart
docker-compose up --build
```

### Option 3 : Restart du service frontend uniquement

```bash
docker-compose restart frontend
```

## Après l'installation

Une fois recharts installé dans le conteneur Docker :

1. Ouvrez `/home/user/BENSBURGER/frontend/src/pages/DashboardPage.jsx`
2. Décommentez les imports recharts (lignes 9-23)
3. Les 3 graphiques s'afficheront automatiquement :
   - 📈 LineChart : Évolution du CA
   - 🏆 BarChart : Top 5 produits
   - 💳 PieChart : Répartition des paiements

## État actuel

Pour l'instant, le Dashboard affiche les données sous forme de **listes simples** pour permettre à l'app de fonctionner normalement. Toutes les autres fonctionnalités (remises, export CSV, SumUp, etc.) sont pleinement opérationnelles.
