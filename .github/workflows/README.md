# GitHub Actions Configuration

## Publication automatique sur NPM

Le workflow `publish.yml` automatise la publication du plugin n8n sur npmjs.org lors de la création de tags.

### Configuration requise

#### Secret NPM_TOKEN

Pour publier sur npmjs, vous devez configurer le secret `NPM_TOKEN` dans les paramètres du repository GitHub :

1. **Créer un token npm :**
   - Aller sur https://www.npmjs.com/settings/tokens
   - Cliquer sur "Generate New Token"
   - Choisir "Automation" (pour CI/CD)
   - Copier le token généré

2. **Configurer le secret GitHub :**
   - Aller dans Settings → Secrets and variables → Actions
   - Cliquer sur "New repository secret"
   - **Nom du secret :** `NPM_TOKEN`
   - **Valeur :** Coller le token npm
   - Cliquer sur "Add secret"

### Déclenchement

Le workflow se déclenche automatiquement lors de la création d'un tag de la forme `v*` :

```bash
# Exemple de déclenchement
git tag v0.2.1
git push origin v0.2.1
```

### Étapes du workflow

1. **Validation du code :**
   - Installation des dépendances avec pnpm
   - Exécution du linter (`pnpm run lint`)
   - Exécution des tests (`pnpm test`)

2. **Build :**
   - Compilation TypeScript
   - Copie des assets (icônes, package.json)
   - Vérification du contenu du répertoire `dist/`

3. **Publication :**
   - Publication sur npmjs depuis le répertoire `dist/`
   - Création automatique d'une release GitHub

### Prérequis

- Le token npm doit avoir les permissions de publication
- Le package doit être public (`--access public`)
- La version dans `package.json` doit correspondre au tag