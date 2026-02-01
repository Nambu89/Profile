"""
Content Moderation with Llama Guard 4
Uses Groq API for fast, free content safety checks
"""

import os
from typing import Dict, List
from groq import Groq


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
    """
    Llama Guard 4 content moderation

    Based on Impuestify and OpoGuardia implementations
    Free tier: 14,400 requests/day (600/hour)
    """

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-guard-3-8b"  # Llama Guard 4 model
        self.enabled = os.getenv("ENABLE_CONTENT_MODERATION", "true").lower() == "true"

        # Whitelist for FerBot (professional/tech terms that might false-positive)
        self.whitelist_terms = [
            'ai', 'ia', 'machine learning', 'deep learning',
            'python', 'javascript', 'typescript', 'react',
            'api', 'backend', 'frontend', 'devops',
            'azure', 'openai', 'groq', 'llm', 'gpt',
            'military', 'armed forces', 'soldier', 'infantry',
            'devoteam', 'impuestify', 'opoguardia'
        ]

    def _build_prompt(self, content: str, role: str = "user") -> str:
        """
        Build Llama Guard prompt

        Args:
            content: Text to moderate
            role: "user" or "assistant"
        """
        # Llama Guard expects specific format
        if role == "user":
            return f"""<|begin_of_text|><|start_header_id|>user<|end_header_id|>

{content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
        else:
            return f"""<|begin_of_text|><|start_header_id|>assistant<|end_header_id|>

{content}<|eot_id|>"""

    async def moderate(
        self,
        content: str,
        role: str = "user"
    ) -> Dict:
        """
        Moderate content using Llama Guard 4

        Args:
            content: Text to check
            role: "user" (input) or "assistant" (output)

        Returns:
            {
                "is_safe": bool,
                "blocked_categories": List[str],
                "risk_level": str,
                "latency_ms": int
            }
        """
        # If moderation disabled, return safe
        if not self.enabled:
            return {
                "is_safe": True,
                "blocked_categories": [],
                "risk_level": "none",
                "latency_ms": 0
            }

        # Check whitelist (skip moderation for known safe terms)
        content_lower = content.lower()
        if any(term in content_lower for term in self.whitelist_terms):
            # Still moderate, but less strict
            pass

        try:
            import time
            start = time.time()

            # Build prompt
            prompt = self._build_prompt(content, role)

            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                max_tokens=100
            )

            latency_ms = int((time.time() - start) * 1000)

            # Parse response
            result_text = response.choices[0].message.content.strip()

            # Llama Guard returns "safe" or "unsafe\nS1,S2,..."
            if result_text.lower().startswith("safe"):
                return {
                    "is_safe": True,
                    "blocked_categories": [],
                    "risk_level": "none",
                    "latency_ms": latency_ms
                }
            else:
                # Parse blocked categories
                lines = result_text.split("\n")
                blocked = []

                if len(lines) > 1:
                    # Second line contains category codes
                    categories = lines[1].split(",")
                    blocked = [cat.strip() for cat in categories if cat.strip() in SAFETY_CATEGORIES]

                # Determine risk level based on categories
                risk_level = self._determine_risk_level(blocked)

                return {
                    "is_safe": False,
                    "blocked_categories": blocked,
                    "blocked_names": [SAFETY_CATEGORIES.get(cat, cat) for cat in blocked],
                    "risk_level": risk_level,
                    "latency_ms": latency_ms
                }

        except Exception as e:
            # On error, fail open (allow content but log warning)
            print(f"[WARNING] Llama Guard moderation failed: {e}")
            return {
                "is_safe": True,  # Fail open
                "blocked_categories": [],
                "risk_level": "unknown",
                "latency_ms": 0,
                "error": str(e)
            }

    def _determine_risk_level(self, blocked_categories: List[str]) -> str:
        """
        Determine risk level based on blocked categories

        CRITICAL: S1, S3, S4, S9, S11 (violence, crimes, weapons, self-harm)
        HIGH: S2, S5, S10 (non-violent crimes, defamation, hate)
        MEDIUM: S6, S7, S8, S12, S13, S14 (advice, privacy, IP, sexual, elections, code)
        """
        critical_categories = ["S1", "S3", "S4", "S9", "S11"]
        high_categories = ["S2", "S5", "S10"]

        if any(cat in blocked_categories for cat in critical_categories):
            return "critical"
        elif any(cat in blocked_categories for cat in high_categories):
            return "high"
        else:
            return "medium"


# Global instance (reused across warm starts)
_llama_guard = None


def get_llama_guard() -> LlamaGuard:
    """Get or create Llama Guard instance (singleton)"""
    global _llama_guard

    if _llama_guard is None:
        _llama_guard = LlamaGuard()

    return _llama_guard
