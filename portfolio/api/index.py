"""
FerBot Chat Endpoint - Vercel Serverless Function
All code consolidated in single file for Vercel compatibility
"""

# Standard library imports
import os
import re
import time
import unicodedata
import logging
from pathlib import Path
from enum import Enum
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

# Third-party imports
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from groq import Groq
import numpy as np
# import pymupdf4llm  # Not needed - using pre-generated JSON

# ==============================================================================
# SECURITY MODULE (from _security.py)
# ==============================================================================

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Prompt Injection Patterns (ES + EN)
PROMPT_INJECTION_PATTERNS = [
    # Ignore instructions (EN + ES)
    (r"ignore\s+.*(?:previous|all|your|above|prior|earlier)\s+(?:instructions?|prompts?|rules?)",
     "instruction_override", RiskLevel.CRITICAL),
    (r"ignora\s+.*(?:todas?|las?|tus?|anteriores?)\s+(?:instrucciones?|normas?|reglas?)",
     "instruction_override", RiskLevel.CRITICAL),

    # New instructions (EN + ES)
    (r"new\s+(?:instructions?|rules?|prompt)\s*[:=]",
     "new_instructions", RiskLevel.CRITICAL),
    (r"nuevas?\s+(?:instrucciones?|reglas?)\s*[:=]",
     "new_instructions", RiskLevel.CRITICAL),

    # Role hijacking (EN + ES)
    (r"(?:from\s+now\s+on|starting\s+now)\s+(?:you\s+are|act\s+as|pretend|be)",
     "role_hijack", RiskLevel.CRITICAL),
    (r"(?:desde\s+ahora|a\s+partir\s+de\s+ahora)\s+(?:eres|act[uú]a\s+como|finge|s[eé])",
     "role_hijack", RiskLevel.CRITICAL),

    # System prompt extraction
    (r"(?:show|reveal|display|print|output|tell|give)\s+(?:me\s+)?(?:your\s+)?(?:system\s+)?(?:prompt|instructions?|rules?)",
     "prompt_extraction", RiskLevel.HIGH),
    (r"(?:muestra|revela|ense[ñn]a|imprime|dame)\s+(?:tu\s+)?(?:prompt|instrucciones?|reglas?)",
     "prompt_extraction", RiskLevel.HIGH),

    # Jailbreak attempts
    (r"(?:DAN|dan)\s*mode", "jailbreak", RiskLevel.CRITICAL),
    (r"jailbreak", "jailbreak", RiskLevel.CRITICAL),

    # Code execution attempts
    (r"```(?:python|javascript|bash|shell|exec|eval)", "code_execution", RiskLevel.HIGH),
    (r"eval\s*\(", "code_execution", RiskLevel.HIGH),
    (r"exec\s*\(", "code_execution", RiskLevel.HIGH),

    # SQL injection
    (r";\s*(?:drop|delete|update|insert|alter|truncate)\s+", "sql_injection", RiskLevel.CRITICAL),
    (r"(?:union)\s+(?:select)", "sql_injection", RiskLevel.CRITICAL),
    (r"'\s*or\s*'1'\s*=\s*'1", "sql_injection", RiskLevel.CRITICAL),

    # Delimiter attacks
    (r"\]\s*\}\s*\{", "json_injection", RiskLevel.MEDIUM),
    (r"```\s*(?:system|assistant|user)", "markdown_injection", RiskLevel.MEDIUM),

    # Unicode invisible characters (bypass attempts)
    (r"[\u200b-\u200f\u2028-\u202e\u2060-\u206f]", "invisible_chars", RiskLevel.MEDIUM),
]


# PII Patterns (Spanish focus)
PII_PATTERNS = {
    "dni": r"\b\d{8}\s*[-]?\s*[A-Za-z]\b",
    "nie": r"\b[XYZxyz]\s*[-]?\s*\d{7}\s*[-]?\s*[A-Za-z]\b",
    "phone": r"\b(?:\+34|0034)?\s*[6789]\d{2}\s*\d{3}\s*\d{3}\b",
    "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    "iban": r"\b[A-Z]{2}\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b",
    "credit_card": r"\b(?:\d{4}[-\s]?){3}\d{4}\b",
}


def normalize_text(text: str) -> str:
    """Normalize Unicode text to prevent bypass attempts"""
    return unicodedata.normalize('NFKC', text)


def detect_prompt_injection(text: str) -> Tuple[bool, List[str], RiskLevel]:
    """Detect prompt injection attempts"""
    normalized = normalize_text(text.lower())
    detected = []
    max_risk = RiskLevel.LOW

    for pattern, name, risk in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, normalized, re.IGNORECASE):
            detected.append(name)
            if risk.value == RiskLevel.CRITICAL.value:
                max_risk = RiskLevel.CRITICAL
            elif risk.value == RiskLevel.HIGH.value and max_risk.value != RiskLevel.CRITICAL.value:
                max_risk = RiskLevel.HIGH
            elif risk.value == RiskLevel.MEDIUM.value and max_risk.value == RiskLevel.LOW.value:
                max_risk = RiskLevel.MEDIUM

    return len(detected) > 0, detected, max_risk


def detect_pii(text: str) -> Tuple[bool, List[str]]:
    """Detect PII (Personally Identifiable Information)"""
    detected = []
    for pii_type, pattern in PII_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            detected.append(pii_type)
    return len(detected) > 0, detected


def sanitize_error_message(error: Exception) -> str:
    """Sanitize error messages to avoid exposing sensitive information"""
    error_type = type(error).__name__
    safe_messages = {
        "ValueError": "Invalid input provided",
        "KeyError": "Missing required field",
        "TypeError": "Invalid data type",
        "HTTPException": "Request processing error",
        "ConnectionError": "Service temporarily unavailable",
        "TimeoutError": "Request took too long to process",
    }
    return safe_messages.get(error_type, "An error occurred processing your request")


def check_input_safety(text: str) -> dict:
    """Comprehensive input safety check"""
    issues = []
    warnings = []

    # Length validation
    text_length = len(text.strip())
    if text_length < 1:
        issues.append("Input too short (minimum 1 characters)")
    elif text_length > 500:
        issues.append("Input too long (maximum 500 characters)")

    # Prompt injection check
    is_injection, injection_patterns, injection_risk = detect_prompt_injection(text)
    if is_injection:
        issues.append(f"Potential prompt injection detected: {', '.join(injection_patterns)}")

    # PII check (warning only)
    has_pii, pii_types = detect_pii(text)
    if has_pii:
        warnings.append(f"PII detected: {', '.join(pii_types)}")

    is_safe = len(issues) == 0 and injection_risk != RiskLevel.CRITICAL
    risk_level = injection_risk if is_injection else RiskLevel.LOW

    return {
        "is_safe": is_safe,
        "risk_level": risk_level.value,
        "issues": issues,
        "warnings": warnings
    }


# ==============================================================================
# MODERATION MODULE (from _moderation.py)
# ==============================================================================

# Llama Guard 4 Safety Categories
SAFETY_CATEGORIES = {
    "S1": "Violent Crimes",
    "S2": "Non-Violent Crimes",
    "S3": "Sex-Related Crimes",
    "S4": "Child Sexual Exploitation",
    "S5": "Defamation",
    "S6": "Specialized Advice (financial, medical, legal)",
    "S7": "Privacy",
    "S8": "Intellectual Property",
    "S9": "Indiscriminate Weapons",
    "S10": "Hate",
    "S11": "Suicide & Self-Harm",
    "S12": "Sexual Content",
    "S13": "Elections",
    "S14": "Code Interpreter Abuse"
}


class LlamaGuard:
    """Llama Guard 4 content moderation"""

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-guard-3-8b"
        self.enabled = os.getenv("ENABLE_CONTENT_MODERATION", "true").lower() == "true"
        self.whitelist_terms = [
            'ai', 'ia', 'machine learning', 'deep learning',
            'python', 'javascript', 'typescript', 'react',
            'api', 'backend', 'frontend', 'devops',
            'azure', 'openai', 'groq', 'llm', 'gpt',
            'military', 'armed forces', 'soldier', 'infantry',
            'devoteam', 'impuestify', 'opoguardia'
        ]

    def _build_prompt(self, content: str, role: str = "user") -> str:
        """Build Llama Guard prompt"""
        if role == "user":
            return f"""<|begin_of_text|><|start_header_id|>user<|end_header_id|>

{content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
        else:
            return f"""<|begin_of_text|><|start_header_id|>assistant<|end_header_id|>

{content}<|eot_id|>"""

    async def moderate(self, content: str, role: str = "user") -> Dict:
        """Moderate content using Llama Guard 4"""
        if not self.enabled:
            return {
                "is_safe": True,
                "blocked_categories": [],
                "risk_level": "none",
                "latency_ms": 0
            }

        try:
            start = time.time()
            prompt = self._build_prompt(content, role)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=100
            )

            latency_ms = int((time.time() - start) * 1000)
            result_text = response.choices[0].message.content.strip()

            if result_text.lower().startswith("safe"):
                return {
                    "is_safe": True,
                    "blocked_categories": [],
                    "risk_level": "none",
                    "latency_ms": latency_ms
                }
            else:
                lines = result_text.split("\n")
                blocked = []
                if len(lines) > 1:
                    categories = lines[1].split(",")
                    blocked = [cat.strip() for cat in categories if cat.strip() in SAFETY_CATEGORIES]

                risk_level = self._determine_risk_level(blocked)

                return {
                    "is_safe": False,
                    "blocked_categories": blocked,
                    "blocked_names": [SAFETY_CATEGORIES.get(cat, cat) for cat in blocked],
                    "risk_level": risk_level,
                    "latency_ms": latency_ms
                }

        except Exception as e:
            print(f"[WARNING] Llama Guard moderation failed: {e}")
            return {
                "is_safe": True,
                "blocked_categories": [],
                "risk_level": "unknown",
                "latency_ms": 0,
                "error": str(e)
            }

    def _determine_risk_level(self, blocked_categories: List[str]) -> str:
        """Determine risk level based on blocked categories"""
        critical_categories = ["S1", "S3", "S4", "S9", "S11"]
        high_categories = ["S2", "S5", "S10"]

        if any(cat in blocked_categories for cat in critical_categories):
            return "critical"
        elif any(cat in blocked_categories for cat in high_categories):
            return "high"
        else:
            return "medium"


# Global instance
_llama_guard = None

def get_llama_guard() -> LlamaGuard:
    """Get or create Llama Guard instance (singleton)"""
    global _llama_guard
    if _llama_guard is None:
        _llama_guard = LlamaGuard()
    return _llama_guard


# ==============================================================================
# SHARED SERVICES (from _shared.py)
# ==============================================================================

class CVDataLoader:
    """Load pre-processed CV data from JSON"""

    def load_cv(self, json_path: str) -> Dict[str, str]:
        """Load CV data from pre-generated JSON file"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                cv_data = json.load(f)

            return {
                "success": True,
                "content": cv_data["full_text"],
                "source": cv_data["metadata"]["source"],
                "sections": cv_data["sections"]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def chunk_content(self, content: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict]:
        """Split content into overlapping chunks"""
        chunks = []
        start = 0
        chunk_id = 0

        while start < len(content):
            end = start + chunk_size
            chunk_text = content[start:end]

            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_text,
                "start": start,
                "end": min(end, len(content))
            })

            chunk_id += 1
            start += chunk_size - overlap

        return chunks


class EmbeddingService:
    """Manages embeddings for RAG system"""

    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            timeout=30.0,
            max_retries=2
        )
        self.model = "text-embedding-3-small"
        self.embeddings_cache: List[Dict] = []

    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return []

    def create_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for multiple texts"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"Error creating batch embeddings: {e}")
            return []

    def cache_embeddings(self, chunks: List[Dict], embeddings: List[List[float]]):
        """Cache embeddings with their source chunks"""
        self.embeddings_cache = [
            {
                "chunk": chunk,
                "embedding": embedding
            }
            for chunk, embedding in zip(chunks, embeddings)
        ]

    def search_similar(self, query: str, top_k: int = 3) -> List[Dict]:
        """Find most similar chunks to query"""
        if not self.embeddings_cache:
            return []

        query_embedding = self.create_embedding(query)
        if not query_embedding:
            return []

        # Calculate similarities using numpy
        query_vec = np.array(query_embedding)
        cache_vecs = np.array([item["embedding"] for item in self.embeddings_cache])

        # Cosine similarity with normalized vectors
        query_norm = query_vec / np.linalg.norm(query_vec)
        cache_norms = cache_vecs / np.linalg.norm(cache_vecs, axis=1, keepdims=True)
        similarities = np.dot(cache_norms, query_norm)

        # Get top-k results
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = []
        for idx in top_indices:
            results.append({
                "chunk": self.embeddings_cache[idx]["chunk"],
                "similarity": float(similarities[idx])
            })

        return results


class RAGService:
    """RAG system for Fernando's portfolio assistant"""

    def __init__(self, embedding_service: EmbeddingService):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            timeout=60.0,
            max_retries=2
        )
        self.embedding_service = embedding_service
        self.model = "gpt-4o-mini"

    def get_system_prompt(self, language: str = "es") -> str:
        """Get system prompt in specified language"""
        prompts = {
            "es": """Eres Fernando Prada, un AI Architect & Tech Lead. Respondes preguntas sobre tu experiencia, proyectos y habilidades.

PERSONALIDAD:
- Profesional pero cercano y conversacional
- Directo y claro en tus respuestas
- Apasionado por la IA y la tecnología
- Orgulloso de tu trayectoria militar que te enseñó disciplina

EXPERIENCIA CLAVE:
- Tech Lead en Devoteam (actual)
- 7 años en Fuerzas Armadas Españolas
- Creador de Impuestify y OpoGuardia
- Experto en Multi-Agent Systems, RAG, Azure OpenAI

INSTRUCCIONES:
1. Responde siempre en primera persona como Fernando
2. Usa el contexto proporcionado para dar respuestas precisas
3. Si no sabes algo, sé honesto: "No tengo esa información en mi experiencia"
4. Sé conversacional pero profesional
5. Menciona proyectos concretos cuando sea relevante
6. NO inventes información que no esté en el contexto

TONO: Profesional, cercano, técnico cuando es necesario""",

            "en": """You are Fernando Prada, an AI Architect & Tech Lead. You answer questions about your experience, projects, and skills.

PERSONALITY:
- Professional yet friendly and conversational
- Direct and clear in your responses
- Passionate about AI and technology
- Proud of your military background that taught you discipline

KEY EXPERIENCE:
- Tech Lead at Devoteam (current)
- 7 years in Spanish Armed Forces
- Creator of Impuestify and OpoGuardia
- Expert in Multi-Agent Systems, RAG, Azure OpenAI

INSTRUCTIONS:
1. Always respond in first person as Fernando
2. Use the provided context for accurate answers
3. If you don't know something, be honest: "I don't have that information in my experience"
4. Be conversational yet professional
5. Mention concrete projects when relevant
6. DO NOT make up information not in the context

TONE: Professional, friendly, technical when necessary"""
        }
        return prompts.get(language, prompts["es"])

    def generate_response(
        self,
        question: str,
        language: str = "es",
        conversation_history: List[Dict] = None
    ) -> Dict:
        """Generate response using RAG"""
        # Retrieve relevant context
        similar_chunks = self.embedding_service.search_similar(question, top_k=3)

        # Build context from chunks
        context_parts = []
        for i, item in enumerate(similar_chunks, 1):
            chunk_text = item["chunk"]["text"]
            similarity = item["similarity"]
            context_parts.append(f"[Fragmento {i}] (relevancia: {similarity:.2f})\n{chunk_text}")

        context = "\n\n---\n\n".join(context_parts)

        # Build messages for OpenAI
        messages = [
            {"role": "system", "content": self.get_system_prompt(language)}
        ]

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history[-6:])

        # Add current question with context
        user_message = f"""CONTEXTO RECUPERADO:
{context}

---

PREGUNTA DEL USUARIO:
{question}"""

        messages.append({"role": "user", "content": user_message})

        # Generate response
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            answer = response.choices[0].message.content

            return {
                "success": True,
                "answer": answer,
                "sources": [
                    {
                        "chunk_id": item["chunk"]["chunk_id"],
                        "similarity": item["similarity"]
                    }
                    for item in similar_chunks
                ],
                "model": self.model,
                "tokens_used": response.usage.total_tokens
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "answer": "Lo siento, hubo un error procesando tu pregunta. Intenta de nuevo."
            }


# Global service instances
_embedding_service = None
_rag_service = None

def get_services():
    """Get or initialize shared services (singleton pattern)"""
    global _embedding_service, _rag_service

    if _rag_service is not None and _embedding_service is not None:
        return _embedding_service, _rag_service

    print("[*] Initializing FerBot services...")

    # Initialize embedding service
    _embedding_service = EmbeddingService()
    print("[OK] Embedding service initialized")

    # Load CV from pre-generated JSON
    cv_json_path = Path(__file__).parent / "data" / "cv_data.json"

    if cv_json_path.exists():
        loader = CVDataLoader()
        cv_data = loader.load_cv(str(cv_json_path))

        if cv_data["success"]:
            print(f"[OK] CV loaded successfully ({len(cv_data['content'])} chars)")

            # Use sections from JSON for better chunking
            chunks = []
            for i, section in enumerate(cv_data.get("sections", [])):
                if section.strip():
                    chunks.append({
                        "chunk_id": i,
                        "text": section,
                        "start": 0,
                        "end": len(section)
                    })

            print(f"[OK] Using {len(chunks)} pre-chunked sections")

            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = _embedding_service.create_embeddings_batch(chunk_texts)
            print(f"[OK] Created {len(embeddings)} embeddings")

            _embedding_service.cache_embeddings(chunks, embeddings)
            print("[OK] Embeddings cached")
        else:
            print(f"[ERROR] Error loading CV: {cv_data.get('error')}")
    else:
        print(f"[WARNING] CV JSON not found at {cv_json_path}")

    # Initialize RAG service
    _rag_service = RAGService(_embedding_service)
    print("[OK] RAG service initialized")
    print("[*] FerBot ready!")

    return _embedding_service, _rag_service


# ==============================================================================
# FASTAPI APP AND ENDPOINT
# ==============================================================================

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple rate limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT = 10
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


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    now = datetime.now()

    rate_limit_store[client_ip] = [
        timestamp for timestamp in rate_limit_store[client_ip]
        if now - timestamp < RATE_WINDOW
    ]

    if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
        return False

    rate_limit_store[client_ip].append(now)
    return True


@app.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Chat endpoint for FerBot with comprehensive security

    Security measures:
    - Rate limiting (10 req/5min)
    - Input validation (length, format)
    - Prompt injection detection
    - PII detection (warning only)
    - Content moderation with Llama Guard 4
    - Sanitized error messages
    """
    try:
        # Get client IP
        forwarded_for = req.headers.get("X-Forwarded-For")
        client_ip = forwarded_for.split(",")[0] if forwarded_for else req.client.host

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

            if moderation_result["risk_level"] in ["critical", "high"]:
                raise HTTPException(
                    status_code=403,
                    detail=f"Content violates safety policies: {', '.join(moderation_result.get('blocked_names', []))}"
                )
            else:
                safety_check["warnings"].append(
                    f"Content flagged: {', '.join(moderation_result.get('blocked_names', []))}"
                )

        # Get services
        _, rag_service = get_services()

        # Generate response
        result = rag_service.generate_response(
            question=request.question,
            language=request.language,
            conversation_history=request.conversation_history
        )

        if not result["success"]:
            logger.error(f"RAG service error: {result.get('error')}")
            raise HTTPException(
                status_code=500,
                detail="Error processing your request. Please try again."
            )

        # Moderate output
        output_moderation = await llama_guard.moderate(result["answer"], role="assistant")

        if not output_moderation["is_safe"]:
            logger.error(
                f"Assistant response blocked by Llama Guard: "
                f"categories={output_moderation['blocked_categories']}"
            )
            result["answer"] = (
                "I apologize, but I cannot provide that information. "
                "Please rephrase your question or ask about my professional experience."
            )
            safety_check["warnings"].append("Response was moderated for safety")

        # Return response
        return ChatResponse(
            answer=result["answer"],
            sources=result.get("sources", []),
            model=result.get("model", "gpt-4o-mini"),
            tokens_used=result.get("tokens_used", 0),
            warnings=safety_check.get("warnings", [])
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {type(e).__name__}: {str(e)}")
        safe_message = sanitize_error_message(e)
        raise HTTPException(
            status_code=500,
            detail=safe_message
        )
