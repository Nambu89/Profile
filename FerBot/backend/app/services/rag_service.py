"""
RAG Service
Retrieval-Augmented Generation for FerBot
"""

import os
from typing import List, Dict
from openai import OpenAI
from .embedding_service import EmbeddingService


class RAGService:
    """RAG system for Fernando's portfolio assistant"""

    def __init__(self, embedding_service: EmbeddingService):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_service = embedding_service
        self.model = "gpt-5-mini"

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

    async def generate_response(
        self,
        question: str,
        language: str = "es",
        conversation_history: List[Dict] = None
    ) -> Dict:
        """
        Generate response using RAG

        Args:
            question: User's question
            language: Response language (es/en)
            conversation_history: Previous messages

        Returns:
            Response with answer and sources
        """
        # 1. Retrieve relevant context
        similar_chunks = await self.embedding_service.search_similar(question, top_k=3)

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
