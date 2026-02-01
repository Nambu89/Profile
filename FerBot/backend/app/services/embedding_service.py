"""
Embedding Service
Creates and manages vector embeddings using OpenAI
"""

import os
from typing import List, Dict
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class EmbeddingService:
    """Manages embeddings for RAG system"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "text-embedding-3-small"  # Cost-effective, good quality
        self.embeddings_cache: List[Dict] = []

    async def create_embedding(self, text: str) -> List[float]:
        """
        Create embedding for text using OpenAI

        Args:
            text: Text to embed

        Returns:
            Embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return []

    async def create_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for multiple texts

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors
        """
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
        """
        Cache embeddings with their source chunks

        Args:
            chunks: List of text chunks
            embeddings: Corresponding embeddings
        """
        self.embeddings_cache = [
            {
                "chunk": chunk,
                "embedding": embedding
            }
            for chunk, embedding in zip(chunks, embeddings)
        ]

    async def search_similar(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Find most similar chunks to query

        Args:
            query: Search query
            top_k: Number of results to return

        Returns:
            List of most similar chunks with scores
        """
        if not self.embeddings_cache:
            return []

        # Create query embedding
        query_embedding = await self.create_embedding(query)
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
