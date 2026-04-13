"""
Token-based authentication for WebSocket connections.
Uses a simple shared secret for development.
In production, replace with JWT or OAuth2.
"""

import hashlib
import hmac
import secrets

from config import settings


def generate_api_key() -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(32)


def validate_token(token: str | None) -> bool:
    """
    Validate a WebSocket connection token.
    When AUTH_ENABLED is False, all connections are allowed (development mode).
    """
    if not settings.AUTH_ENABLED:
        return True
    if not token or not settings.API_SECRET_KEY:
        return False
    return hmac.compare_digest(
        hashlib.sha256(token.encode()).hexdigest(),
        hashlib.sha256(settings.API_SECRET_KEY.encode()).hexdigest(),
    )
