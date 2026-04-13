from unittest.mock import patch

from middleware.auth import generate_api_key, validate_token


class TestAuth:
    def test_generate_api_key_unique(self):
        k1 = generate_api_key()
        k2 = generate_api_key()
        assert k1 != k2
        assert len(k1) > 20

    def test_validate_disabled(self):
        """When auth is disabled, all tokens pass."""
        with patch("middleware.auth.settings") as mock_settings:
            mock_settings.AUTH_ENABLED = False
            assert validate_token(None) is True
            assert validate_token("") is True
            assert validate_token("anything") is True

    def test_validate_enabled_correct(self):
        with patch("middleware.auth.settings") as mock_settings:
            mock_settings.AUTH_ENABLED = True
            mock_settings.API_SECRET_KEY = "my-secret"  # noqa: S105
            assert validate_token("my-secret") is True

    def test_validate_enabled_wrong(self):
        with patch("middleware.auth.settings") as mock_settings:
            mock_settings.AUTH_ENABLED = True
            mock_settings.API_SECRET_KEY = "my-secret"  # noqa: S105
            assert validate_token("wrong") is False

    def test_validate_enabled_none(self):
        with patch("middleware.auth.settings") as mock_settings:
            mock_settings.AUTH_ENABLED = True
            mock_settings.API_SECRET_KEY = "secret"  # noqa: S105
            assert validate_token(None) is False
