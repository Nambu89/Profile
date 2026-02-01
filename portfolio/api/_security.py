"""
Security utilities for FerBot
Based on security measures from Impuestify and OpoGuardia
"""

import re
import unicodedata
from typing import Tuple, List
from enum import Enum


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
    # NFKC normalization (compatibility decomposition + canonical composition)
    # This prevents homoglyph attacks
    return unicodedata.normalize('NFKC', text)


def detect_prompt_injection(text: str) -> Tuple[bool, List[str], RiskLevel]:
    """
    Detect prompt injection attempts

    Returns:
        (is_injection, detected_patterns, risk_level)
    """
    # Normalize first
    normalized = normalize_text(text.lower())

    detected = []
    max_risk = RiskLevel.LOW

    for pattern, name, risk in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, normalized, re.IGNORECASE):
            detected.append(name)
            # Track highest risk level
            if risk.value == RiskLevel.CRITICAL.value:
                max_risk = RiskLevel.CRITICAL
            elif risk.value == RiskLevel.HIGH.value and max_risk.value != RiskLevel.CRITICAL.value:
                max_risk = RiskLevel.HIGH
            elif risk.value == RiskLevel.MEDIUM.value and max_risk.value == RiskLevel.LOW.value:
                max_risk = RiskLevel.MEDIUM

    is_injection = len(detected) > 0

    return is_injection, detected, max_risk


def detect_pii(text: str) -> Tuple[bool, List[str]]:
    """
    Detect PII (Personally Identifiable Information)

    Returns:
        (has_pii, detected_types)
    """
    detected = []

    for pii_type, pattern in PII_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            detected.append(pii_type)

    has_pii = len(detected) > 0

    return has_pii, detected


def sanitize_error_message(error: Exception) -> str:
    """
    Sanitize error messages to avoid exposing sensitive information

    Returns generic error message for user
    """
    # Never expose internal error details to users
    error_type = type(error).__name__

    # Map specific errors to user-friendly messages
    safe_messages = {
        "ValueError": "Invalid input provided",
        "KeyError": "Missing required field",
        "TypeError": "Invalid data type",
        "HTTPException": "Request processing error",
        "ConnectionError": "Service temporarily unavailable",
        "TimeoutError": "Request took too long to process",
    }

    return safe_messages.get(error_type, "An error occurred processing your request")


def validate_input_length(text: str, min_length: int = 1, max_length: int = 500) -> Tuple[bool, str]:
    """
    Validate input text length

    Returns:
        (is_valid, error_message)
    """
    text_length = len(text.strip())

    if text_length < min_length:
        return False, f"Input too short (minimum {min_length} characters)"

    if text_length > max_length:
        return False, f"Input too long (maximum {max_length} characters)"

    return True, ""


def check_input_safety(text: str) -> dict:
    """
    Comprehensive input safety check

    Returns dict with:
        - is_safe: bool
        - risk_level: RiskLevel
        - issues: List[str]
        - warnings: List[str]
    """
    issues = []
    warnings = []

    # Length validation
    is_valid_length, length_error = validate_input_length(text)
    if not is_valid_length:
        issues.append(length_error)

    # Prompt injection check
    is_injection, injection_patterns, injection_risk = detect_prompt_injection(text)
    if is_injection:
        issues.append(f"Potential prompt injection detected: {', '.join(injection_patterns)}")

    # PII check (warning only, not blocking)
    has_pii, pii_types = detect_pii(text)
    if has_pii:
        warnings.append(f"PII detected: {', '.join(pii_types)}")

    # Determine overall safety
    is_safe = len(issues) == 0 and injection_risk != RiskLevel.CRITICAL

    # Use highest risk level found
    risk_level = injection_risk if is_injection else RiskLevel.LOW

    return {
        "is_safe": is_safe,
        "risk_level": risk_level.value,
        "issues": issues,
        "warnings": warnings
    }
