# 🏦 Treasory - Plateforme de Gestion de Trésorerie

Plateforme complète (backend Node/Express + frontend React/Vite + PostgreSQL) pour gérer la trésorerie, les comptes, les transactions, la messagerie interne, et des dashboards d’analytics.

Ce guide explique comment installer et démarrer le projet de bout en bout avec Docker, et couvre les problèmes fréquents (Prisma, CORS, ports, DNS Docker, etc.).

---

## 1) Prérequis

- Docker Desktop (avec WSL2 activé sur Windows)
- WSL2 (Ubuntu recommandé) si vous êtes sous Windows
- Ports disponibles:
  - Frontend: 5173 (Vite dev server)
  - Backend API: 3001
  - Postgres: 5433 sur l’hôte (mappé vers 5432 dans le conteneur)

---

## 2) Cloner le projet

```bash
git clone <repository>
cd treasory-platform
```

---

## 3) Configuration des variables d’environnement

Le fichier `.env` à la racine du dossier `backend/` doit contenir (ce fichier est copié dans l’image au build pour Prisma):

```env
# backend/.env
DATABASE_URL="postgresql://treasory_user:treasory_password@postgres:5432/treasory?schema=public"
JWT_SECRET="development-jwt-secret-change-in-production"
NODE_ENV="development"
PORT="3001"

# Email (optionnel – mettre des valeurs réelles en prod)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# CORS (frontend dev URL)
FRONTEND_URL="http://localhost:5173"
```

Notes importantes:
- `DATABASE_URL` doit correspondre exactement aux identifiants Postgres définis dans `docker-compose.yml` (user/db/password/host/port/schema).
- Le service Postgres écoute sur 5432 dans le conteneur, mais est exposé en 5433 sur l’hôte. Gardez `postgres:5432` côté backend.

---

## 4) Lancement avec Docker

Toutes les commandes Docker ci-dessous sont montrées avec `wsl` pour Windows. Sur macOS/Linux, enlevez simplement le préfixe `wsl`.

### 4.1 Construire et démarrer

```bash
docker compose up -d --build
```

Cette étape:
- construit `backend` (copie `.env`, génère Prisma client, etc.)
- construit `frontend`
- démarre `postgres`, `backend`, `frontend`

### 4.2 Vérifier l’état

```bash
docker compose ps
```
Vous devriez voir:
- postgres: `0.0.0.0:5433->5432/tcp`
- backend: `0.0.0.0:3001->3001/tcp`
- frontend: `0.0.0.0:5173->5173/tcp`

### 4.3 Vérifier l’API (health check)

Ouvrir dans le navigateur:

- `http://localhost:3001/api/health`

Si OK, vous verrez un JSON avec `status: OK`.

---

## 5) Initialiser la base de données (Prisma)

Le schéma Prisma se trouve dans `backend/prisma/schema.prisma`.

### 5.1 Créer les tables (db push)

```bash
docker compose exec backend npx prisma db push
```

### 5.2 (Optionnel) Ouvrir Prisma Studio

```bash
docker compose exec backend npx prisma studio
```

### 5.3 Injecter des données de base (seed)

Le seed crée un espace de travail, un bureau, et un utilisateur admin par défaut:
- email: `admin@treasory.com`
- mot de passe: `admin123`
- rôle: `ADMIN_1`

```bash
docker compose exec backend npm run db:seed
```

---

## 6) Accéder à l’application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

Par défaut, le frontend pointe vers `http://localhost:3001/api`. Vous pouvez le modifier via la variable d’environnement `VITE_API_URL` (voir `docker-compose.yml`).

Authentification (si seed exécuté):
- email: `admin@treasory.com`
- mot de passe: `admin123`

---

## 7) Configuration CORS

Le backend autorise par défaut:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Vous pouvez personnaliser via la variable `FRONTEND_URL` (côté backend) et la config CORS dans `backend/src/app.ts`.

Symptôme: erreur navigateur "blocked by CORS policy" → assurez-vous que l’origine du frontend est listée et que le backend tourne.

---

## 8) E-mails (développement vs production)

En développement, si aucun SMTP n’est configuré, les e-mails ne sont pas envoyés mais loggés en console. Pour activer l’envoi réel, fournissez `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (et configurez TLS/ports selon votre fournisseur) et passez `NODE_ENV=production`.

Fichier concerné: `backend/src/services/emailService.ts`.

---

## 9) Dépannage (FAQ)

### 9.1 Port Postgres déjà utilisé (5432)

Erreur: `bind: address already in use` lors du démarrage de Postgres.

Solution utilisée ici: exposer Postgres sur `5433` côté hôte.

Dans `docker-compose.yml` (déjà configuré):
```yaml
services:
  postgres:
    ports:
      - "5433:5432"
```

### 9.2 Prisma: `P1012 Environment variable not found: DATABASE_URL`

Pendant le build Docker, Prisma a besoin de `DATABASE_URL`. Assurez-vous que le `.env` est copié avant `prisma generate` (dans `backend/Dockerfile`) ou passez la valeur via `build.args` dans `docker-compose.yml`.

### 9.3 Prisma: tables inexistantes (`P2021`)

Erreur du type: `The table public.espaces_travail does not exist` → vous n’avez pas encore exécuté:

```bash
docker compose exec backend npx prisma db push
```

Puis lancez:

```bash
docker compose exec backend npm run db:seed
```

### 9.4 ERR_CONNECTION_REFUSED / API injoignable

- Vérifiez que `backend` expose bien le port:
  - Dans `docker-compose.yml`, section `backend`:
    ```yaml
    ports:
      - "3001:3001"
    ```
- Le serveur Express doit écouter `0.0.0.0` (géré dans `backend/src/index.ts`).
- Vérifiez l’état des conteneurs: `wsl docker compose ps`.

### 9.5 CORS: preflight échoue

Erreur navigateur du type: `No 'Access-Control-Allow-Origin' header…` →

- Assurez-vous que `allowedOrigins` dans `backend/src/app.ts` contient l’URL du frontend.
- Vérifiez `FRONTEND_URL` dans `docker-compose.yml` → `http://localhost:5173` en dev.

### 9.6 Email: `EAUTH Invalid login`

Sans SMTP valide en dev, c’est normal. Les e-mails sont loggés. Configurez des identifiants valides en production.

---

## 10) Commandes utiles

```bash
# Arrêter et supprimer les conteneurs
docker compose down

# Rebuild complet
docker compose up -d --build

# Logs du backend
docker compose logs -f backend

# Exécuter une commande dans le conteneur backend
docker compose exec backend sh
```

---

## 12) Notes de sécurité (production)

- Remplacez toutes les valeurs par défaut (`JWT_SECRET`, mots de passe, etc.).
- Utilisez un SMTP fiable et sécurisé.
- Servez le frontend derrière un reverse proxy (Nginx, Traefik) en HTTPS.
- Gérez les migrations Prisma via `prisma migrate` pour les environnements partagés.

---

Bon démarrage ! Si vous rencontrez un souci, reportez-vous à la section Dépannage et comparez votre configuration aux exemples ci-dessus.