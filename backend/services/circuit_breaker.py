"""
Circuit breaker pattern to prevent cascading failures.
When a service fails repeatedly, the circuit opens and fast-fails
for a cooldown period before allowing retries.
"""

import logging
import time
from enum import Enum
from typing import Any, Callable

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    CLOSED = "closed"       # Normal operation
    OPEN = "open"           # Failing, reject requests
    HALF_OPEN = "half_open" # Testing if service recovered


class CircuitBreaker:
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0.0

    def call(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        if self.state == CircuitState.OPEN:
            if time.monotonic() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                logger.info("Circuit %s: HALF_OPEN — testing recovery", self.name)
            else:
                raise CircuitOpenError(f"Circuit {self.name} is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self) -> None:
        if self.state == CircuitState.HALF_OPEN:
            logger.info("Circuit %s: recovered → CLOSED", self.name)
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_time = time.monotonic()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(
                "Circuit %s: OPEN after %d failures",
                self.name,
                self.failure_count,
            )


class CircuitOpenError(Exception):
    pass
