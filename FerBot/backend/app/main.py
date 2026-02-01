"""
FerBot - Fernando Prada's Portfolio AI Assistant
Main FastAPI application with RAG system
"""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .services.pdf_parser import PDFParser
from .services.embedding_service import EmbeddingService
from .services.rag_service import RAGService
from .routers import chat

# Load environment variables
load_dotenv()

# Global services (initialized on startup)
embedding_service = None
rag_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    global embedding_service, rag_service

    print("[*] Starting FerBot...")

    # 1. Initialize embedding service
    embedding_service = EmbeddingService()
    print("[OK] Embedding service initialized")

    # 2. Parse CV
    cv_path = Path(__file__).parent / "data" / "CV_LinkedIn.pdf"
    if not cv_path.exists():
        print(f"[WARNING] CV not found at {cv_path}")
        print("[INFO] Please add CV_LinkedIn.pdf to app/data/")
    else:
        parser = PDFParser()
        cv_data = parser.parse_cv(str(cv_path))

        if cv_data["success"]:
            print(f"[OK] CV parsed successfully ({len(cv_data['content'])} chars)")

            # 3. Create chunks
            chunks = parser.chunk_content(cv_data["content"], chunk_size=800, overlap=150)
            print(f"[OK] Created {len(chunks)} chunks")

            # 4. Create embeddings
            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = await embedding_service.create_embeddings_batch(chunk_texts)
            print(f"[OK] Created {len(embeddings)} embeddings")

            # 5. Cache embeddings
            embedding_service.cache_embeddings(chunks, embeddings)
            print("[OK] Embeddings cached")
        else:
            print(f"[ERROR] Error parsing CV: {cv_data.get('error')}")

    # 6. Initialize RAG service
    rag_service = RAGService(embedding_service)
    print("[OK] RAG service initialized")

    print("[*] FerBot ready!")

    yield

    print("[*] Shutting down FerBot...")


# Create FastAPI app
app = FastAPI(
    title="FerBot API",
    description="AI Assistant for Fernando Prada's Portfolio",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://fernandoprada.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "FerBot",
        "version": "1.0.0",
        "description": "AI Assistant for Fernando Prada's Portfolio",
        "docs": "/docs",
        "status": "operational"
    }
