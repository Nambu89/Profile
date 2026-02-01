# FerBot Backend

AI-powered assistant for Fernando Prada's portfolio with RAG (Retrieval-Augmented Generation).

## Features

- 🤖 RAG system with OpenAI embeddings
- 📄 PDF parsing with PyMuPDF4LLM
- 🌐 Bilingual (ES/EN) responses
- 🚦 Rate limiting
- ⚡ Fast and lightweight

## Tech Stack

- FastAPI
- OpenAI API (GPT-5-mini + text-embedding-3-small)
- PyMuPDF4LLM for PDF extraction
- scikit-learn for similarity search

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`

4. Run locally:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### POST `/api/chat`
Chat with FerBot

Request:
```json
{
  "question": "¿Cuál es tu experiencia con IA?",
  "language": "es"
}
```

Response:
```json
{
  "answer": "Como AI Architect en Devoteam...",
  "sources": [...],
  "model": "gpt-5-mini",
  "tokens_used": 150
}
```

### GET `/api/health`
Health check

## Deploy to Railway

1. Create new project on Railway
2. Connect GitHub repo
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy!

Railway will automatically detect `railway.toml` and deploy.

## Rate Limiting

- 10 requests per 5 minutes per IP
- Returns 429 if exceeded

## License

MIT
