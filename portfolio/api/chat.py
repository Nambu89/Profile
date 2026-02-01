"""
FerBot Chat Endpoint - Vercel Serverless Function
With comprehensive security measures
"""

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import logging

from ._shared import get_services
from ._security import check_input_safety, sanitize_error_message, RiskLevel
from ._moderation import get_llama_guard

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel handles CORS at edge level
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple rate limiting (in-memory, resets on cold starts)
rate_limit_store = defaultdict(list)
RATE_LIMIT = 10  # requests per window
RATE_WINDOW = timedelta(minutes=5)


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="User question about Fernando's experience"
    )
    language: Optional[str] = Field(
        default="es",
        pattern="^(es|en)$",
        description="Response language (es or en)"
    )
    conversation_history: Optional[List[Dict]] = Field(
        default=None,
        max_items=10,
        description="Previous conversation (max 10 messages)"
    )


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict]] = []
    model: str
    tokens_used: Optional[int] = 0
    warnings: Optional[List[str]] = []


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int


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


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)

    # Security headers (matching Impuestify/OpoGuardia)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "object-src 'none';"
    )

    # Hide server information
    try:
        del response.headers["Server"]
    except KeyError:
        pass

    return response


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Chat endpoint for FerBot with comprehensive security

    Security measures:
    - Rate limiting (10 req/5min)
    - Input validation (length, format)
    - Prompt injection detection
    - PII detection (warning only)
    - Sanitized error messages
    - Security headers
    """
    try:
        # Get client IP
        forwarded_for = req.headers.get("X-Forwarded-For")
        client_ip = forwarded_for.split(",")[0] if forwarded_for else req.client.host

        # Log request (no PII)
        logger.info(f"Chat request from {client_ip}, lang={request.language}")

        # Check rate limit
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for {client_ip}")
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please wait a few minutes before trying again."
            )

        # Security validation
        safety_check = check_input_safety(request.question)

        if not safety_check["is_safe"]:
            logger.warning(
                f"Unsafe input detected from {client_ip}: {safety_check['issues']}"
            )
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input: {', '.join(safety_check['issues'])}"
            )

        # Block CRITICAL risk level
        if safety_check["risk_level"] == RiskLevel.CRITICAL.value:
            logger.error(
                f"Critical security risk from {client_ip}: {safety_check['issues']}"
            )
            raise HTTPException(
                status_code=403,
                detail="Request blocked for security reasons"
            )

        # Content moderation with Llama Guard 4
        llama_guard = get_llama_guard()
        moderation_result = await llama_guard.moderate(request.question, role="user")

        if not moderation_result["is_safe"]:
            logger.warning(
                f"Content blocked by Llama Guard from {client_ip}: "
                f"categories={moderation_result['blocked_categories']}, "
                f"risk={moderation_result['risk_level']}"
            )

            # Block based on risk level
            if moderation_result["risk_level"] in ["critical", "high"]:
                raise HTTPException(
                    status_code=403,
                    detail=f"Content violates safety policies: {', '.join(moderation_result.get('blocked_names', []))}"
                )
            else:
                # Medium risk: add warning but allow
                safety_check["warnings"].append(
                    f"Content flagged: {', '.join(moderation_result.get('blocked_names', []))}"
                )

        # Get services (lazy initialization)
        _, rag_service = get_services()

        # Generate response
        result = rag_service.generate_response(
            question=request.question,
            language=request.language,
            conversation_history=request.conversation_history
        )

        if not result["success"]:
            logger.error(f"RAG service error: {result.get('error')}")
            # Don't expose internal error
            raise HTTPException(
                status_code=500,
                detail="Error processing your request. Please try again."
            )

        # Moderate output (assistant response)
        output_moderation = await llama_guard.moderate(result["answer"], role="assistant")

        if not output_moderation["is_safe"]:
            logger.error(
                f"Assistant response blocked by Llama Guard: "
                f"categories={output_moderation['blocked_categories']}"
            )
            # Replace with safe fallback
            result["answer"] = (
                "I apologize, but I cannot provide that information. "
                "Please rephrase your question or ask about my professional experience."
            )
            safety_check["warnings"].append("Response was moderated for safety")

        # Return response with warnings if any
        return ChatResponse(
            answer=result["answer"],
            sources=result.get("sources", []),
            model=result.get("model", "gpt-5-mini"),
            tokens_used=result.get("tokens_used", 0),
            warnings=safety_check.get("warnings", [])
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Log full error internally
        logger.error(f"Unexpected error in chat endpoint: {type(e).__name__}: {str(e)}")

        # Return sanitized error to user
        safe_message = sanitize_error_message(e)
        raise HTTPException(
            status_code=500,
            detail=safe_message
        )


# Vercel serverless handler
handler = app
