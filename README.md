# 🚀 AeroLeads Assignment (Full Stack | AI + Automation)

A comprehensive, 3-module backend project demonstrating **Web Scraping**, **AI Voice Automation**, and **Content Generation**, built using **FastAPI (Python)**, **Node.js (Express)**, and **Twilio + Gemini APIs** — all integrated for real-world automation.

> ⚙️ Designed for professional-grade backend demonstration — combining AI, scraping, and telephony automation in one system.

---

## 🧭 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [LinkedIn Scraper (FastAPI + Playwright)](#1️⃣-linkedin-scraper-fastapi--playwright)
5. [AI Autodialer (Node.js + Twilio + Gemini)](#2️⃣-ai-autodialer-nodejs--twilio--gemini)
6. [AI Blog Generator (Node.js + LLM)](#3️⃣-ai-blog-generator-nodejs--llm)
7. [Ngrok Setup](#🌐-ngrok-setup)
8. [Author](#👨‍💻-author)

---

## 🧩 Overview

This project showcases **three distinct backend microservices** that solve different automation problems:

| Module | Description |
|--------|-------------|
| **LinkedIn Scraper** | Web scraping engine built with FastAPI + Playwright for extracting profile data. |
| **AI Autodialer** | Twilio-based calling automation app that uses Gemini AI for conversational messages. |
| **AI Blog Generator** | Automatic blog creation tool powered by Gemini/OpenAI LLMs. |

All services are modular and can run **independently** or **as a suite**.

---

## ⚙️ Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Languages** | Python 3.12, JavaScript (Node.js v18+) |
| **Frameworks** | FastAPI, Express.js |
| **Automation Tools** | Playwright (Chromium) |
| **AI / LLM APIs** | Google Gemini, OpenAI |
| **Telephony** | Twilio Voice API, Webhooks |
| **Databases (optional)** | SQLite / In-memory |
| **Frontend** | EJS, HTML, CSS, JavaScript |
| **Deployment** | Render / Ngrok |
| **Tools** | Gunicorn, Uvicorn, Nodemon |

---

## 📁 Project Structure

```
aeroleads-assignment-restructured/
│
├── linkedin-scraper/
│   ├── api.py
│   ├── scraper_playwright.py
│   ├── config.py
│   ├── requirements.txt
│   └── profiles.csv
│
├── autodialer-app/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── views/
│   ├── public/
│   ├── server.js
│   └── .env
│
├── blog/
│   ├── generator.js
│   ├── views/
│   ├── public/
│
└── README.md
```

---

## 1️⃣ LinkedIn Scraper (FastAPI + Playwright)

A **Python 3.12** microservice that automates LinkedIn login, scrapes public profile data, and serves the results through a FastAPI endpoint.  
It’s **Render-deployable** and runs fully headless via **Playwright (Chromium)**.

### 🔧 Features:
- Automates login (test LinkedIn account)
- Extracts **Name**, **Headline**, **Location**, and **About**
- Saves to CSV (`profiles.csv`)
- Exposes `/scrape` API endpoint
- Deployed on Render using Gunicorn + Uvicorn

---

### 🧩 Setup

#### 1. Environment Setup
```bash
cd linkedin-scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install-deps
playwright install chromium
```

#### 2. .env
```env
LINKEDIN_EMAIL=your_test_email
LINKEDIN_PASSWORD=your_test_password
```

#### 3. Run Locally
```bash
uvicorn api:app --reload --port 8001
```

#### 4. API Example
POST → /scrape
```json
{
  "urls": [
    "https://www.linkedin.com/in/satyanadella",
    "https://www.linkedin.com/in/sundarpichai"
  ]
}
```

**Response:**
```json
{
  "count": 2,
  "data": [
    {
      "url": "https://linkedin.com/in/satyanadella",
      "name": "Satya Nadella",
      "headline": "Chairman & CEO at Microsoft",
      "about": "Leading Microsoft’s transformation..."
    }
  ]
}
```

**Output File:** profiles.csv

---

### 🚀 Deploy on Render

**Build Command:**
```bash
pip install -r requirements.txt && playwright install-deps && playwright install chromium
```

**Start Command:**
```bash
gunicorn -k uvicorn.workers.UvicornWorker api:app
```

**Environment Variables:**
```bash
LINKEDIN_EMAIL=your_test_email
LINKEDIN_PASSWORD=your_test_password
PYTHON_VERSION=3.12.0
```

Then open → https://<your-app>.onrender.com/docs

---

## 2️⃣ AI Autodialer (Node.js + Twilio + Gemini)

A **voice automation system** that calls users, delivers AI-generated or pre-defined messages, and captures keypad (DTMF) responses.

### 🔧 Features
- Bulk or single calls using Twilio
- AI message generation with Gemini API
- Custom text-to-speech fallback
- Logs call details and responses
- Webhook handling via ngrok
- Real-time UI built with EJS

---

### 🧩 Setup

```bash
cd autodialer-app
npm install
npm run dev
```

#### .env Example
```env
PORT=3000
APP_URL=http://localhost:3000
BASE_URL=https://<your-ngrok-id>.ngrok.io

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1415XXXXXXX

GEMINI_API_KEY=your_google_gemini_key
```

#### Run ngrok
```bash
ngrok http 3000
```

Copy the forwarding URL into .env → BASE_URL

---

### 📡 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/dialer/upload | Upload phone list |
| POST | /api/dialer/call | Start bulk calls |
| POST | /api/dialer/call-single | Make one call |
| GET | /api/dialer/logs | Retrieve call logs |
| POST | /api/dialer/webhook | Twilio status callback |
| ALL | /api/dialer/twiml | AI or TTS call response |
| POST | /api/dialer/dtmf | Handle “Press 1” input |

---

### 🧪 Demo Flow

1. Start ngrok  
   ```bash
   ngrok http 3000
   ```
2. Run server  
   ```bash
   npm run dev
   ```
3. Open the UI → upload phone list → “Start Calling”
4. Twilio initiates voice calls
5. Caller presses digits → webhook logs it
6. Logs visible on dashboard

---

## 3️⃣ AI Blog Generator (Node.js + LLM)

A content generator that creates professional blog articles on developer topics using **Gemini / ChatGPT / Perplexity APIs**.

### 🔧 Features
- Input list of blog topics
- Fetch AI-generated full-length blogs
- Save as .md or .txt
- Supports any LLM backend
- Fast and lightweight

---

### 🧩 Setup

```bash
cd blog
npm install
node generator.js
```

#### Example
```bash
Enter topics: Golang vs Python, FastAPI Tips
```

**Output:**
```
/blogs/
 ├── golang-vs-python.md
 ├── fastapi-tips.md
```

---

## 🌐 Ngrok Setup

For webhook testing (Twilio callbacks):
```bash
ngrok http 3000
```

You’ll get:
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

Update .env:
```env
BASE_URL=https://abc123.ngrok.io
```

---

## 👨‍💻 Author

**Prithvi Raj**  
Backend Developer | FastAPI | Node.js | Golang | AI Integrations  

🔗 [LinkedIn](https://www.linkedin.com/in/prithvi-raj/)  
💻 [GitHub](https://github.com/Rajprithvi2021)

---

## 🏁 Summary

✅ **LinkedIn Scraper** — FastAPI + Playwright + Render-ready  
✅ **AI Autodialer** — Node.js + Twilio + Gemini  
✅ **Blog Generator** — AI-driven article creation  
✅ **Integrated via modular, production-grade codebase**

> 💡 “Three practical automations — demonstrating AI integration, browser automation, and telephony at scale.”