/**
 * Simple in-memory rate limiter for API routes
 * Prevents abuse and DoS attacks
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the time window
     */
    maxRequests: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Rate limiter using IP address as identifier
 * @param identifier - Unique identifier (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with remaining requests and reset time
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
        // Create new entry
        const resetTime = now + config.windowMs;
        rateLimitMap.set(identifier, { count: 1, resetTime });
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: resetTime,
        };
    }

    // Increment existing entry
    entry.count++;

    if (entry.count > config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.resetTime,
        };
    }

    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetTime,
    };
}

/**
 * Get client IP from request headers
 * Supports various proxy headers with trust validation
 */
export function getClientIp(request: Request): string {
    // Cloudflare (most reliable when using CF)
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp.trim();
    }

    // X-Forwarded-For (common proxy header)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        // Get trusted proxies from env (comma-separated)
        const trustedProxies = process.env.TRUSTED_PROXIES?.split(',').map(p => p.trim()) || [];

        // Return first non-trusted IP (actual client)
        const clientIp = ips.find(ip => !trustedProxies.includes(ip));
        if (clientIp) {
            return clientIp;
        }

        // Fallback to first IP if all are trusted (shouldn't happen)
        return ips[0];
    }

    // X-Real-IP (Nginx proxy)
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    // Fallback to a generic identifier
    return 'unknown';
}

/**
 * Abuse tracking (in-memory)
 * Tracks repeat rate limit violations
 */
const abuseTracker = new Map<string, { count: number; lastViolation: number }>();

// Clean up abuse tracker every hour
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, data] of abuseTracker.entries()) {
        if (data.lastViolation < oneHourAgo) {
            abuseTracker.delete(key);
        }
    }
}, 60 * 60 * 1000);

/**
 * Track a rate limit violation for anti-abuse
 */
export function trackAbuse(identifier: string): void {
    const existing = abuseTracker.get(identifier);
    if (existing) {
        existing.count++;
        existing.lastViolation = Date.now();
    } else {
        abuseTracker.set(identifier, { count: 1, lastViolation: Date.now() });
    }
}

/**
 * Check if identifier has been flagged as abusive
 * @returns true if more than 50 rate limit violations in the last hour
 */
export function isAbusive(identifier: string): boolean {
    const data = abuseTracker.get(identifier);
    return data ? data.count > 50 : false;
}

/**
 * Get abuse count for identifier
 */
export function getAbuseCount(identifier: string): number {
    return abuseTracker.get(identifier)?.count || 0;
}

