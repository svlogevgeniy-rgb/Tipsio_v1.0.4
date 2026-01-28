import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from "./rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    // Reset time for consistent testing
    vi.useFakeTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const result1 = checkRateLimit("test-user", {
        maxRequests: 5,
        windowMs: 60000,
      });

      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit("test-user", {
        maxRequests: 5,
        windowMs: 60000,
      });

      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it("should block requests exceeding limit", () => {
      const config = { maxRequests: 3, windowMs: 60000 };

      // Make 3 requests (at limit)
      checkRateLimit("test-user", config);
      checkRateLimit("test-user", config);
      checkRateLimit("test-user", config);

      // 4th request should be blocked
      const result = checkRateLimit("test-user", config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after time window expires", () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      // Use up the limit
      checkRateLimit("test-user", config);
      checkRateLimit("test-user", config);

      // Should be blocked
      const blocked = checkRateLimit("test-user", config);
      expect(blocked.success).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      const allowed = checkRateLimit("test-user", config);
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBe(1);
    });

    it("should track different identifiers separately", () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      // User 1 uses up their limit
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      const user1Blocked = checkRateLimit("user-1", config);
      expect(user1Blocked.success).toBe(false);

      // User 2 should still be allowed
      const user2Allowed = checkRateLimit("user-2", config);
      expect(user2Allowed.success).toBe(true);
    });
  });

  describe("getClientIdentifier", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-real-ip": "192.168.1.2",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.2");
    });

    it("should prefer x-forwarded-for over x-real-ip", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "192.168.1.2",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });

    it("should return unknown when no IP headers present", () => {
      const request = new Request("http://localhost");
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("unknown");
    });
  });

  describe("createRateLimitResponse", () => {
    it("should create proper 429 response", () => {
      const result = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      };

      const response = createRateLimitResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBeTruthy();
    });

    it("should include error message in body", async () => {
      const result = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      };

      const response = createRateLimitResponse(result);
      const body = await response.json();

      expect(body.error).toBe("Too many requests");
      expect(body.message).toBe("Please try again later");
    });
  });
});
