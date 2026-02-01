"""
Chat Router
Handles chat requests for FerBot
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/api", tags=["chat"])

# Simple rate limiting (in-memory)
rate_limit_store = defaultdict(list)
RATE_LIMIT = 10  # requests per window
RATE_WINDOW = timedelta(minutes=5)


class ChatRequest(BaseModel):
    question: str
    language: Optional[str] = "es"
    conversation_history: Optional[List[Dict]] = None


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict]] = []
    model: str
    tokens_used: Optional[int] = 0


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    now = datetime.now()

    # Clean old entries
    rate_limit_store[client_ip] = [
        timestamp for timestamp in rate_limit_store[client_ip]
        if now - timestamp < RATE_WINDOW
    ]

    # Check limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
        return False

    # Add current request
    rate_limit_store[client_ip].append(now)
    return True


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Chat endpoint for FerBot

    Args:
        request: Chat request with question and optional history
        req: FastAPI request object for IP tracking

    Returns:
        ChatResponse with answer and sources
    """
    # Get client IP
    client_ip = req.client.host if req.client else "unknown"

    # Check rate limit
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a few minutes before trying again."
        )

    # Validate question
    if not request.question or len(request.question.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    if len(request.question) > 500:
        raise HTTPException(
            status_code=400,
            detail="Question too long. Maximum 500 characters."
        )

    # Import services (initialized in main.py)
    from ..main import rag_service

    # Generate response
    result = await rag_service.generate_response(
        question=request.question,
        language=request.language,
        conversation_history=request.conversation_history
    )

    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Internal server error")
        )

    return ChatResponse(
        answer=result["answer"],
        sources=result.get("sources", []),
        model=result.get("model", "gpt-5-mini"),
        tokens_used=result.get("tokens_used", 0)
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FerBot",
        "version": "1.0.0"
    }
