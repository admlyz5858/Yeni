# Bilge Baykuş - NotebookLM Backend

Node.js + Express + TypeScript backend for Google NotebookLM Enterprise API integration.

## Architecture

- **client/** - API clients (NotebookLM, Gemini)
- **service/** - Business logic
- **controllers/** - HTTP request handlers
- **middleware/** - Auth (Supabase JWT)
- **routes/** - Express routes

## Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 3001) |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (for auth + DB) |
| NOTEBOOKLM_ACCESS_TOKEN | Bearer token from `gcloud auth print-access-token` |
| GCP_PROJECT_NUMBER | Google Cloud project number |
| GCP_LOCATION | `us`, `eu`, or `global` |
| GEMINI_API_KEY | For ask-ai (context-based answers) |

## API Endpoints

All require `Authorization: Bearer <supabase_jwt>`.

### POST /api/notebook/create-notebook
Creates a notebook for the user. Idempotent (returns existing if any).

### POST /api/notebook/add-note
Body: `{ "content": "text", "sourceName": "optional" }`
Adds a text note as a source to the user's notebook.

### POST /api/notebook/ask-ai
Body: `{ "question": "soru" }`
Returns AI answer based on notebook context (via Gemini when sources exist).

## Database

Run Supabase migrations:
```bash
supabase db push
# or apply supabase/migrations/20250324000001_user_notebooks.sql
```

## Mobile App

Set `EXPO_PUBLIC_NOTEBOOK_API_URL` in app/.env to your server URL (e.g. `http://10.0.2.2:3001` for Android emulator).
