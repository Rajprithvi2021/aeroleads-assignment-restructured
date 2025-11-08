# 🚀 AeroLeads Assignment (Restructured)

A comprehensive, 3-module project demonstrating **Web Scraping**, **AI Voice Automation**, and **Content Generation**, built using **FastAPI (Python)**, **Node.js (Express)**, and **Twilio API** — with full **ngrok integration** for webhook testing.

> ✨ This restructured version enhances all functionalities, making the backend professional and frontend impactful.

---

## 🧭 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Ngrok Setup](#ngrok-setup)
6. [API Endpoints](#api-endpoints)
7. [Demo Flow](#demo-flow)
8. [Author](#author)

---

## 🧩 Overview

### 1️⃣ LinkedIn Scraper (`linkedin-scraper/`)
Scrapes public LinkedIn profiles and saves the data into CSV using **FastAPI** + **Selenium**.

#### 🔧 Features:
- Automates LinkedIn login (test account)
- Extracts: Name, Headline, Location, About, and Company
- Supports rotating proxies and browser headers
- Saves data to CSV
- API endpoint to trigger scraping and return JSON

📦 **Tech:** Python 3.12, FastAPI, Selenium, ChromeDriver

---

### 2️⃣ AI Autodialer (`autodialer-app/`)
A **Node.js + Twilio + Gemini AI** powered web app that automatically calls users, speaks custom or AI-generated messages, and records responses.

#### 🔧 Features:
- Upload 100+ phone numbers via UI
- Initiate single or bulk automated calls
- Handle DTMF input (“Press 1 to confirm”)
- AI voice message generation via **Gemini API**
- Fallback to plain TTS if AI fails
- Displays call logs and status in real-time
- Integrates **ngrok** for webhook testing (Twilio callback URLs)

📦 **Tech:** Node.js, Express, Twilio Voice API, Google Gemini API, EJS frontend

---

### 3️⃣ AI Blog Generator (`blog/`)
Automatically generates 10+ articles on given programming topics using AI APIs.

#### 🔧 Features:
- Enter list of blog titles or topics
- AI generates full blog content
- Supports **Gemini**, **ChatGPT**, or **Perplexity**
- Stores generated content locally

📦 **Tech:** Node.js, LLM API, File System

---

## ⚙️ Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Backend** | FastAPI, Node.js, Express.js |
| **Web Scraping** | Selenium, ChromeDriver |
| **AI / LLMs** | Google Gemini API, OpenAI API |
| **Telephony** | Twilio Voice API, TwiML, Webhooks |
| **Frontend** | EJS, HTML, CSS, JS |
| **Database (Optional)** | SQLite / In-memory |
| **Dev Tools** | ngrok, nodemon, pip, npm |

---

## 📁 Project Structure

```
aeroleads-assignment-restructured/
│
├── linkedin-scraper/
│   ├── api.py
│   ├── scraper.py
│   ├── utils/
│   ├── config.py
│   ├── requirements.txt
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
├── .gitignore
└── README.md
```

---

## 🧩 Setup Instructions

### 🔹 Common Prerequisites
- **Python 3.12+**
- **Node.js v18+**
- **Google Chrome + ChromeDriver**
- **ngrok** (for webhook testing)
- **Twilio Account** (for calling)
- **Gemini / OpenAI API Key**

---

### 🔹 1. LinkedIn Scraper (Python + FastAPI)

```bash
cd linkedin-scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8001
```

Visit: 👉 `http://127.0.0.1:8001/docs`

#### Example API Request:
```bash
POST /scrape
{
  "urls": [
    "https://www.linkedin.com/in/satyanadella",
    "https://www.linkedin.com/in/sundarpichai"
  ]
}
```

Output:
```json
[
  {"url": "https://linkedin.com/in/satyanadella", "name": "Satya Nadella", "headline": "CEO Microsoft", "location": "USA"}
]
```

---

### 🔹 2. Autodialer App (Node.js + Twilio + Gemini)

```bash
cd autodialer-app
npm install
npm run dev   # or: node server.js
```

#### `.env` Example
```env
PORT=3000
APP_URL=http://localhost:3000
BASE_URL=https://<your-ngrok-url>.ngrok.io

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1415XXXXXXX

GEMINI_API_KEY=your_google_gemini_key
```

---

### 🔹 3. Blog Generator (Node.js)
```bash
cd blog
npm install
node generator.js
```

---

## 🌐 Ngrok Setup

To make your local server public for **Twilio callbacks**, run:
```bash
ngrok http 3000
```

You’ll get:
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

Now copy that URL into your `.env`:
```env
BASE_URL=https://abc123.ngrok.io
```

Twilio will send events to:
```
https://abc123.ngrok.io/api/dialer/webhook
```

---

## 📡 API Endpoints (Autodialer)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/dialer/upload` | Upload multiple phone numbers |
| `POST` | `/api/dialer/call` | Start calling uploaded numbers |
| `POST` | `/api/dialer/call-single` | Make a single call |
| `GET` | `/api/dialer/logs` | Get all call logs |
| `POST` | `/api/dialer/webhook` | Twilio call status callback |
| `ALL` | `/api/dialer/twiml` | TwiML response for AI or normal TTS |
| `POST` | `/api/dialer/dtmf` | Handle DTMF input (Press 1 to confirm) |

---

## 🧪 Demo Flow

1. **Start ngrok**:  
   ```bash
   ngrok http 3000
   ```
2. **Run Autodialer**:  
   ```bash
   npm run dev
   ```
3. **Upload phone numbers** via the frontend UI
4. **Click “Start Calling”**
5. **Twilio initiates calls**
6. **Press 1** on call to confirm  
7. Logs appear in UI → shows call status (`initiated`, `ringing`, `completed`)

---

## 📊 Sample Output

```json
{
  "success": true,
  "message": "Calls initiated successfully",
  "logs": [
    {
      "sid": "CAxxxxxx",
      "to": "+9198xxxxxxx",
      "status": "completed",
      "ai": true,
      "time": "2025-11-07T10:33:41Z"
    }
  ]
}
```

---

## 👨‍💻 Author

**Prithvi Raj**  
Backend Developer | FastAPI | Node.js | Golang | AI Integrations  

📧 [Connect on LinkedIn](https://www.linkedin.com/in/prithvi-raj/)  
💻 GitHub: [Rajprithvi2021](https://github.com/Rajprithvi2021)

---

## 🏁 Summary

✅ Fully functional assignment combining:
- LinkedIn Scraper (Python + FastAPI)  
- AI Autodialer (Node.js + Twilio + Gemini)  
- AI Blog Generator  

✅ Integrated with:
- **Twilio Voice API**
- **Google Gemini AI**
- **ngrok for webhook tunneling**

> 💡 “This project shows real-world backend problem solving: AI + automation + integrations — all in one.”

---