
# Aeroleads Assignment — Restructured (React Frontend + Clean APIs)

This repo now contains **three separate exercises** as folders, each self-contained:
- `linkedin-scraper/` — Python Selenium scraper (now with optional FastAPI API) + React frontend.
- `autodialer-app/` — Node/Express backend for dialing + **new React frontend** (Vite + Tailwind) under `frontend/`.
- `blog-generator/` — A reusable Node API to generate programming articles via LLM (and a tiny React client). Autodialer consumes this under `/blog`.

## What changed
- Added modern **React frontends** (Vite + Tailwind) to provide a professional, dashboard-like UI for each exercise.
- The backend is API-first. Existing Express controllers are reused where possible. New `/api/*` routes exposed for the frontends.
- Wrote clean, production-like UI with routing, forms, tables, toasts, and loading states.

## Quick Start

### 1) LinkedIn Scraper
Backend (Python):
```bash
cd linkedin-scraper
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
# optional API (FastAPI)
pip install fastapi uvicorn[standard] python-multipart
uvicorn api:app --reload --port 8001
```

Frontend:
```bash
cd linkedin-scraper/frontend
npm i
npm run dev
```

### 2) Autodialer
Backend:
```bash
cd autodialer-app
npm i
npm run dev  # assumes nodemon; or: node server.js
```

Frontend:
```bash
cd autodialer-app/frontend
npm i
npm run dev
```

### 3) Blog Generator
Backend:
```bash
cd blog-generator
npm i
npm run dev
```

Frontend:
```bash
cd blog-generator/frontend
npm i
npm run dev
```

> Configure environment variables as shown in each folder's `README.md` (Twilio creds, LLM API keys, proxies, LinkedIn account).
