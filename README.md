# ◆ SnapShot AI — Professional Headshot Generator

> Transform any selfie into a studio-perfect professional headshot using AI.  
> Built by **Mindtech Solutions** — Ready for Vercel deployment.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)
![Claude AI](https://img.shields.io/badge/Claude-AI-c9a84c?style=flat-square)

---

## ✨ Features

### 📸 AI Photo Analysis (Claude Vision)
- Upload any selfie (JPG, PNG, WEBP — up to 10MB)
- Claude AI analyzes lighting, framing, expression, attire, quality
- Scores your photo 1–10 with specific improvement suggestions
- Detects issues: blur, dark lighting, obstructions, etc.
- Recommends optimal crop formats for different platforms
- Interactive crop tool: 1:1 · 4:5 · 3:4 · 2:3 · 16:9

### 🎨 8 Professional Style Templates
| Template | Best For |
|---|---|
| Corporate Executive | C-suite, Directors, Finance |
| LinkedIn Professional | Job seekers, Networkers |
| Tech & Startup | Founders, Engineers, PMs |
| Creative Professional | Designers, Artists |
| Healthcare & Medical | Doctors, Nurses |
| Real Estate Agent | Realtors, Property Pros |
| Legal Professional | Attorneys, Lawyers |
| Speaker & Thought Leader | TEDx, Conference Speakers |

### 🖼️ 12 Background Options
White Studio · Neutral Grey · Deep Navy · Dark Charcoal · Warm Gradient · Cool Gradient · Blurred Office · Natural Greenery · Golden Hour · Library/Books · Studio Purple · Transparent PNG

### ✍️ Master Prompt Builder
- Platform target: LinkedIn, Resume, Company Website, Upwork, etc.
- Lighting: 8 professional options
- Mood / Expression: 8 options
- Attire: free-text custom input
- Enhancement pills: skin texture, eye contact, glasses, beard, etc.
- **AI Enhance** button — Claude improves your prompt using photo analysis context
- One-click copy with character + word count

### 🗂️ Sample Prompts Gallery
- 6 ready-to-use professional prompts (Corporate, Tech, Creative, Medical, Real Estate, Legal)
- Illustrated style previews with portrait illustrations
- One-click "Use in Builder" pre-fills the prompt builder
- Photo tips for getting best results per style

---

## 🚀 Quick Start

```bash
git clone https://github.com/JAY-PANCHAL/snapshotai.git
cd snapshotai
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
# Open http://localhost:3000
```

---

## 📦 Deploy to Vercel (Free)

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration (Recommended)
1. Push this repo to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the `snapshotai` repository
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Click **Deploy**

### Setting the API Key in Vercel
1. Project Dashboard → **Settings** → **Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
3. Redeploy

---

## 🌐 Free Custom Domain Options

| Option | Domain | Cost | Notes |
|--------|--------|------|-------|
| **Vercel** | `yourapp.vercel.app` | Free | Instant, no setup |
| **Vercel + own domain** | `snapshotai.com` | ~$10/yr | Best option |
| **Freenom** | `snapshotai.tk` | Free | 12 months free |
| **js.org** | `snapshotai.js.org` | Free | For JS projects |
| **Cloudflare Pages** | `snapshotai.pages.dev` | Free | Alternative to Vercel |

**Easiest path:** Deploy on Vercel → use `snapshotai.vercel.app` (free, instant).

---

## 🏗️ Project Structure

```
snapshotai/
├── api/
│   └── claude.js              # Vercel serverless proxy (keeps API key secure)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx/.module.css
│   │   ├── Hero.jsx/.module.css
│   │   ├── PhotoUploader.jsx/.module.css   ← Upload + AI Analysis
│   │   ├── TemplateSelector.jsx/.module.css ← 8 Style Templates
│   │   ├── SampleGallery.jsx/.module.css   ← Sample Prompts Gallery
│   │   ├── PromptBuilder.jsx/.module.css   ← Master Prompt Builder
│   │   └── Footer.jsx/.module.css
│   ├── data/
│   │   └── templates.js       ← Templates, backgrounds, sample prompts data
│   ├── utils/
│   │   ├── imageUtils.js      ← Crop, resize, prompt builder logic
│   │   └── claudeApi.js       ← Claude API hooks (analysis + enhancement)
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── vercel.json
└── vite.config.js
```

---

## 🔌 Architecture

```
User uploads photo
       ↓
[Browser] Canvas API crops + resizes image
       ↓
base64 → POST /api/claude (Vercel serverless)
       ↓
[Server] ANTHROPIC_API_KEY + Claude Vision API
       ↓
JSON analysis: score, lighting, framing, issues, suggestions
       ↓
[Browser] Analysis feeds into Prompt Builder
       ↓
User configures template + options → Master Prompt generated
       ↓
User copies prompt → pastes into Midjourney / DALL·E / etc.
```

---

## 🎯 Where to Use Generated Prompts

| Platform | Type | Cost |
|----------|------|------|
| [Midjourney](https://midjourney.com) | `/imagine` command | $10/mo |
| [DALL·E 3](https://chat.openai.com) | ChatGPT | $20/mo |
| [Adobe Firefly](https://firefly.adobe.com) | Web app | Free tier |
| [Stable Diffusion](https://stability.ai) | Self-hosted | Free |
| [HeadshotPro](https://headshotpro.com) | Dedicated tool | $29+ |
| [BetterPic](https://betterpic.io) | Dedicated tool | $25+ |
| [Aragon AI](https://aragon.ai) | Style variety | $35+ |

---

## 🛠️ Tech Stack

- **React 18** + **Vite 5** — Frontend framework + build tool
- **CSS Modules** — Scoped, collision-free styling
- **Claude claude-sonnet-4-20250514** — Photo analysis + prompt AI enhancement
- **Vercel Serverless** — Secure API proxy (no API key in frontend)
- **Canvas API** — Client-side image cropping + resizing

---

*SnapShot AI — Built by Mindtech Solutions. Because your first impression deserves studio quality.*
