# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that integrates with the mes-démarches API (French Polynesia). It allows n8n workflows to interact with the mes-démarches.gov.pf platform for automating administrative processes.

## Development Commands

### Build & Development
- `npm run build` - Full build: TypeScript compilation + Gulp tasks (icons + package.json copy)
- `npm run dev` - Development mode with TypeScript watch
- `tsc` - TypeScript compilation only
- `gulp build:icons` - Copy SVG icons to dist/
- `gulp copy:package` - Copy package.json to dist/

### Code Quality
- `npm run lint` - ESLint check on TypeScript files
- `npm run lintfix` - ESLint with auto-fix
- `npm run format` - Prettier formatting

### Testing
- `npm test` - Run Jest test suite
- Jest config covers `nodes/**/*.ts` and `credentials/**/*.ts`
- Test files: `tests/**/*.test.ts`

### Package Management
- Uses pnpm (v8.6+) as package manager
- Node.js 18.10+ required
- `npm run prepublishOnly` - Pre-publish checks (build + lint)

## Architecture Overview

### Core Components
- **Node Implementation**: `nodes/MesDemarches/MesDemarches.node.ts` - Main business logic
- **Credentials**: `credentials/MesDemarchesApi.credentials.ts` - API authentication
- **Internationalization**: `src/i18n/labels.ts` - Centralized labels (prepared for future i18n)

### n8n Integration Points
- Node type: `mesDemarches` 
- Credentials type: `mesDemarchesApi`
- Icon: `mes-demarches.svg`
- Output entry point: `dist/` directory

### Operations Architecture
The node supports 7 operations:
1. `listDossiers` - List files with intelligent sync
2. `getDemarche` - Get procedure info  
3. `getDossier` - Get specific file
4. `envoyerMessage` - Send message to user
5. `modifierAnnotation` - Modify private annotations
6. `modifierStatutDossier` - Change file status
7. `handleError` - Error recovery workflow

### API Integration
- Uses GraphQL API at `/api/v2/graphql`
- Bearer token authentication
- Stored procedures for optimization
- Base64 ID conversion for GraphQL Relay format

### State Management
- Synchronization state persisted in `~/.n8n/mes-demarches-sync.json`
- Supports resumable operations after interruption
- Auto-detection of last successful sync

## Key Implementation Details

### GraphQL ID Conversion
The node automatically converts human-readable IDs to GraphQL format:
- User input: `123456` 
- GraphQL format: `RG9zc2llci0xMjM0NTY=` (base64 of `Dossier-123456`)

### Synchronization Logic
- ORDER ASC enforced to prevent data loss
- Conditional state saving only on complete success
- Batch processing with 100-item limit
- Automatic retry from exact failure point

### Error Handling
- User-friendly error messages in French
- Explicit validation for missing resources
- Operation-specific error recovery

## File Structure

```
├── nodes/MesDemarches/
│   ├── MesDemarches.node.ts    # Main node implementation
│   └── mes-demarches.svg       # Node icon
├── credentials/
│   └── MesDemarchesApi.credentials.ts  # API credentials config
├── src/i18n/
│   └── labels.ts               # Internationalization labels
├── tests/
│   ├── MesDemarches.node.test.ts
│   └── MesDemarchesApi.credentials.test.ts
├── dist/                       # Build output (TypeScript → JS)
└── gulpfile.js                # Asset pipeline (icons, package.json)
```

## Testing Strategy

- Jest configuration for TypeScript
- Node.js test environment  
- Coverage collection from `nodes/` and `credentials/`
- Test patterns: `**/*.test.ts`, `**/tests/**/*.test.ts`

## Development Workflow

1. Make changes to TypeScript source files
2. Run `npm run build` to compile and copy assets
3. Run `npm test` to verify tests pass
4. Run `npm run lint` to check code style
5. For n8n testing: restart n8n instance to load updated plugin

## Docker Integration

- `docker-compose.yml` and `docker-compose-dev.yml` available
- `Dockerfile.n8n` for containerized development
- `start-n8n.sh` script for quick startup

## Plugin Registration

The package registers with n8n via package.json:
```json
"n8n": {
  "n8nNodesApiVersion": 1,
  "credentials": ["dist/credentials/MesDemarchesApi.credentials.js"],
  "nodes": ["dist/nodes/MesDemarches/MesDemarches.node.js"]
}
```