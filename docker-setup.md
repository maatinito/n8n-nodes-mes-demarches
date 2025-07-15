# Guide d'installation n8n + Plugin mes-démarches avec Docker

## 1. Préparer le plugin pour l'installation

D'abord, créons le package npm du plugin :

```bash
# Dans le répertoire du plugin
cd n8n-nodes-mes-demarches

# S'assurer que tout est compilé
npm run build

# Créer le package npm (génère un fichier .tgz)
npm pack
```

## 2. Créer le Dockerfile personnalisé

Créer un fichier `Dockerfile.n8n` dans le répertoire du plugin :

```dockerfile
FROM n8nio/n8n:latest

# Passer en mode root pour installer le package
USER root

# Copier notre plugin packagé
COPY n8n-nodes-mes-demarches-*.tgz /tmp/

# Installer le plugin
RUN cd /tmp && \
    npm install -g n8n-nodes-mes-demarches-*.tgz && \
    rm n8n-nodes-mes-demarches-*.tgz

# Revenir à l'utilisateur n8n
USER node

# Variables d'environnement pour le plugin
ENV N8N_CUSTOM_EXTENSIONS="/usr/local/lib/node_modules"
</dockerfile>

## 3. Créer le docker-compose.yml

Créer un fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  n8n:
    build:
      context: .
      dockerfile: Dockerfile.n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      # Permettre les packages externes (important pour notre plugin)
      - NODE_FUNCTION_ALLOW_EXTERNAL=*
    volumes:
      - n8n_data:/home/node/.n8n
      # Volume pour le développement (optionnel)
      - ./workflows:/home/node/.n8n/workflows
    restart: unless-stopped

volumes:
  n8n_data:
```

## 4. Alternative : Installation par volume (plus simple pour le développement)

Si vous préférez une approche plus simple pour le développement :

### docker-compose-dev.yml
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      # Permettre l'installation de packages depuis l'interface
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
    volumes:
      - n8n_data:/home/node/.n8n
      # Monter notre plugin directement
      - ./dist:/usr/local/lib/node_modules/n8n-nodes-mes-demarches:ro
    restart: unless-stopped

volumes:
  n8n_data:
```

## 5. Scripts de lancement

Créer un script `start-n8n.sh` :

```bash
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
echo "  - Arrêter: docker-compose down"
echo "  - Logs: docker-compose logs -f n8n"
echo "  - Rebuild plugin: npm run build && docker-compose restart n8n"
```

## 6. Démarrage

```bash
# Rendre le script exécutable
chmod +x start-n8n.sh

# Option 1: Mode développement (recommandé)
./start-n8n.sh

# Option 2: Avec image personnalisée
./start-n8n.sh build
```

## 7. Vérification de l'installation

1. **Accéder à n8n** : http://localhost:5678
2. **Se connecter** : admin / password
3. **Créer un nouveau workflow**
4. **Ajouter un nœud** : Chercher "mes-démarches"

Si le nœud n'apparaît pas :

```bash
# Vérifier les logs
docker-compose logs n8n

# Redémarrer après recompilation
npm run build
docker-compose restart n8n
```

## 8. Configuration des credentials

1. **Aller dans Settings > Credentials**
2. **Créer un nouveau credential** de type "API mes-démarches"
3. **Renseigner** :
   - Serveur : `https://www.mes-demarches.gov.pf`
   - Token API : votre token
4. **Tester la connexion**

## 9. Développement itératif

Pour développer efficacement :

```bash
# Terminal 1: Watch mode pour auto-compilation
npm run dev

# Terminal 2: Redémarrer n8n après chaque changement
# (seulement nécessaire pour les changements de structure)
docker-compose restart n8n
```

## 10. Troubleshooting

### Le plugin n'apparaît pas
```bash
# Vérifier que le plugin est dans le container
docker exec -it $(docker-compose ps -q n8n) ls -la /usr/local/lib/node_modules/ | grep mes-demarches

# Vérifier les logs n8n
docker-compose logs n8n | grep -i "mes-demarches\|error"
```

### Erreurs de compilation
```bash
# Nettoyer et recompiler
rm -rf dist node_modules
npm install
npm run build
```

### Problèmes de permissions
```bash
# Ajuster les permissions si nécessaire
sudo chown -R $USER:$USER dist/
```

## 11. Production

Pour la production, utilisez l'approche Dockerfile avec un registry npm privé :

```bash
# Publier sur un registry privé
npm publish --registry=https://your-private-registry.com

# Puis dans le Dockerfile
RUN npm install -g n8n-nodes-mes-demarches --registry=https://your-private-registry.com
```