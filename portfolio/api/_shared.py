"""
Shared services for FerBot API
Initialized once and reused across serverless function calls
"""

import os
from pathlib import Path
from typing import Dict, List
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pymupdf4llm

# Global cache for embeddings (persists across warm starts)
_embeddings_cache = None
_embedding_service = None
_rag_service = None


class PDFParser:
    """Parse PDF using PyMuPDF4LLM for LLM-optimized output"""

    def parse_cv(self, pdf_path: str) -> Dict[str, str]:
        """Parse CV PDF to markdown"""
        try:
            md_text = pymupdf4llm.to_markdown(pdf_path)
            return {
                "success": True,
                "content": md_text,
                "source": "CV_LinkedIn.pdf"
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
            timeout=30.0,  # 30 second timeout for embeddings
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

        # Create query embedding
        query_embedding = self.create_embedding(query)
        if not query_embedding:
            return []

        # Calculate similarities
        query_vec = np.array([query_embedding])
        cache_vecs = np.array([item["embedding"] for item in self.embeddings_cache])

        similarities = cosine_similarity(query_vec, cache_vecs)[0]

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
            timeout=60.0,  # 60 second timeout for chat completions
            max_retries=2  # Retry up to 2 times on failure
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
        # 1. Retrieve relevant context
        similar_chunks = self.embedding_service.search_similar(question, top_k=3)

        # 2. Build context from chunks
        context_parts = []
        for i, item in enumerate(similar_chunks, 1):
            chunk_text = item["chunk"]["text"]
            similarity = item["similarity"]
            context_parts.append(f"[Fragmento {i}] (relevancia: {similarity:.2f})\n{chunk_text}")

        context = "\n\n---\n\n".join(context_parts)

        # 3. Build messages for OpenAI
        messages = [
            {"role": "system", "content": self.get_system_prompt(language)}
        ]

        # Add conversation history if exists
        if conversation_history:
            messages.extend(conversation_history[-6:])  # Last 3 exchanges

        # Add current question with context
        user_message = f"""CONTEXTO RECUPERADO:
{context}

---

PREGUNTA DEL USUARIO:
{question}"""

        messages.append({"role": "user", "content": user_message})

        # 4. Generate response
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            answer = response.choices[0].message.content

            # 5. Format response
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


def get_services():
    """Get or initialize shared services (singleton pattern for serverless)"""
    global _embeddings_cache, _embedding_service, _rag_service

    # If already initialized, return cached services
    if _rag_service is not None and _embedding_service is not None:
        return _embedding_service, _rag_service

    print("[*] Initializing FerBot services...")

    # Initialize embedding service
    _embedding_service = EmbeddingService()
    print("[OK] Embedding service initialized")

    # Parse CV (embedded in code to avoid file system issues in serverless)
    # Note: We'll need to embed the CV content or read from a static location
    cv_path = Path(__file__).parent / "data" / "CV_LinkedIn.pdf"

    if cv_path.exists():
        parser = PDFParser()
        cv_data = parser.parse_cv(str(cv_path))

        if cv_data["success"]:
            print(f"[OK] CV parsed successfully ({len(cv_data['content'])} chars)")

            # Create chunks
            chunks = parser.chunk_content(cv_data["content"], chunk_size=800, overlap=150)
            print(f"[OK] Created {len(chunks)} chunks")

            # Create embeddings
            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = _embedding_service.create_embeddings_batch(chunk_texts)
            print(f"[OK] Created {len(embeddings)} embeddings")

            # Cache embeddings
            _embedding_service.cache_embeddings(chunks, embeddings)
            print("[OK] Embeddings cached")
        else:
            print(f"[ERROR] Error parsing CV: {cv_data.get('error')}")
    else:
        print(f"[WARNING] CV not found at {cv_path}")

    # Initialize RAG service
    _rag_service = RAGService(_embedding_service)
    print("[OK] RAG service initialized")

    print("[*] FerBot ready!")

    return _embedding_service, _rag_service
