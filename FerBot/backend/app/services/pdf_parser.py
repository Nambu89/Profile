"""
PDF Parser Service
Extracts content from Fernando's CV PDF
"""

import pymupdf4llm
from pathlib import Path
from typing import Dict, List


class PDFParser:
    """Parse PDF documents and extract structured content"""

    @staticmethod
    def parse_cv(pdf_path: str) -> Dict[str, str]:
        """
        Parse CV PDF using PyMuPDF4LLM for optimal LLM formatting

        Args:
            pdf_path: Path to PDF file

        Returns:
            Dict with markdown content
        """
        try:
            # Extract with PyMuPDF4LLM (preserves structure for LLMs)
            md_text = pymupdf4llm.to_markdown(pdf_path)

            return {
                "success": True,
                "content": md_text,
                "source": "CV_LinkedIn.pdf"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": ""
            }

    @staticmethod
    def chunk_content(content: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, any]]:
        """
        Split content into chunks for embedding

        Args:
            content: Text content to chunk
            chunk_size: Size of each chunk
            overlap: Overlap between chunks

        Returns:
            List of chunks with metadata
        """
        chunks = []
        words = content.split()

        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)

            chunks.append({
                "text": chunk_text,
                "chunk_id": len(chunks),
                "start_index": i,
                "word_count": len(chunk_words)
            })

        return chunks
