#!/bin/bash
# Script de build pour Render
# 1. Installer les dépendances du backend
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Installer les dépendances du frontend
cd ../sgsu-frontend
npm install

# 4. Compiler le frontend
npm run build

# 5. Copier le frontend compilé dans le dossier public du backend
mkdir -p ../sgsu-backend-node/public
cp -r dist/* ../sgsu-backend-node/public/

echo "✅ Build terminé !"
