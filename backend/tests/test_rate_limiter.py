from middleware.rate_limiter import RateLimiter


class TestRateLimiter:
    def test_allows_within_burst(self):
        limiter = RateLimiter(rate=1.0, burst=5)
        for _ in range(5):
            assert limiter.allow("client1") is True

    def test_rejects_over_burst(self):
        limiter = RateLimiter(rate=1.0, burst=3)
        for _ in range(3):
            limiter.allow("client1")
        assert limiter.allow("client1") is False

    def test_separate_clients(self):
        limiter = RateLimiter(rate=1.0, burst=2)
        limiter.allow("a")
        limiter.allow("a")
        assert limiter.allow("a") is False
        assert limiter.allow("b") is True

    def test_remove_client(self):
        limiter = RateLimiter(rate=1.0, burst=2)
        limiter.allow("a")
        limiter.remove_client("a")
        # After removal, client gets fresh bucket
        assert limiter.allow("a") is True


class TestRateLimiterRefill:
    def test_tokens_refill(self):
        limiter = RateLimiter(rate=100.0, burst=5)
        for _ in range(5):
            limiter.allow("c")
        # At rate=100/s, tokens refill almost instantly
        import time
        time.sleep(0.1)
        assert limiter.allow("c") is True
