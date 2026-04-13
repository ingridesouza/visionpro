import pytest

from services.circuit_breaker import CircuitBreaker, CircuitOpenError, CircuitState


class TestCircuitBreaker:
    def test_starts_closed(self):
        cb = CircuitBreaker("test")
        assert cb.state == CircuitState.CLOSED

    def test_success_keeps_closed(self):
        cb = CircuitBreaker("test")
        result = cb.call(lambda: 42)
        assert result == 42
        assert cb.state == CircuitState.CLOSED

    def test_opens_after_threshold(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        for _ in range(3):
            with pytest.raises(ValueError, match="boom"):
                cb.call(_fail)
        assert cb.state == CircuitState.OPEN

    def test_open_rejects_immediately(self):
        cb = CircuitBreaker("test", failure_threshold=1, recovery_timeout=9999)
        with pytest.raises(ValueError, match="boom"):
            cb.call(_fail)
        with pytest.raises(CircuitOpenError):
            cb.call(lambda: 1)

    def test_half_open_recovery(self):
        cb = CircuitBreaker("test", failure_threshold=1, recovery_timeout=0)
        with pytest.raises(ValueError, match="boom"):
            cb.call(_fail)
        assert cb.state == CircuitState.OPEN
        # Recovery timeout = 0 so it immediately transitions
        result = cb.call(lambda: "recovered")
        assert result == "recovered"
        assert cb.state == CircuitState.CLOSED


def _fail():
    raise ValueError("boom")
