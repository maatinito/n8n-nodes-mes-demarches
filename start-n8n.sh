#!/bin/bash

echo "🚀 Démarrage de n8n avec le plugin mes-démarches..."

# Vérifier que le plugin est compilé
if [ ! -d "dist" ]; then
    echo "📦 Compilation du plugin..."
    npm run build
fi

# Option 1: Avec Dockerfile personnalisé
if [ "$1" = "build" ]; then
    echo "🐳 Construction de l'image Docker personnalisée..."
    npm pack
    docker-compose up --build
    exit 0
fi

# Option 2: Mode développement (par défaut)
echo "🔧 Mode développement..."
docker-compose -f docker-compose-dev.yml up -d

echo "✅ n8n démarré sur http://localhost:5678"
echo "👤 Identifiants: admin / password"
echo ""
echo "📋 Commandes utiles:"
echo "  - Arrêter: docker-compose -f docker-compose-dev.yml down"
echo "  - Logs: docker-compose -f docker-compose-dev.yml logs -f n8n"
echo "  - Rebuild plugin: npm run build && docker-compose -f docker-compose-dev.yml restart n8n"