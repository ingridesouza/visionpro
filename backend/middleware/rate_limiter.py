"""
Token-bucket rate limiter for WebSocket connections.
Limits per-client frame submission rate to prevent abuse.
"""

import time
from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class _Bucket:
    tokens: float = 10.0
    last_refill: float = field(default_factory=time.monotonic)


class RateLimiter:
    def __init__(self, rate: float = 5.0, burst: int = 10):
        """
        Args:
            rate: tokens per second (sustained throughput).
            burst: max tokens (peak allowance).
        """
        self.rate = rate
        self.burst = burst
        self._buckets: dict[str, _Bucket] = defaultdict(lambda: _Bucket(tokens=burst))

    def allow(self, client_id: str) -> bool:
        bucket = self._buckets[client_id]
        now = time.monotonic()
        elapsed = now - bucket.last_refill
        bucket.tokens = min(self.burst, bucket.tokens + elapsed * self.rate)
        bucket.last_refill = now

        if bucket.tokens >= 1.0:
            bucket.tokens -= 1.0
            return True
        return False

    def remove_client(self, client_id: str) -> None:
        self._buckets.pop(client_id, None)
