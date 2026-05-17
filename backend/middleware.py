import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

RATE_LIMIT_DURATION = 60  # seconds
RATE_LIMIT_REQUESTS = 30  # requests per minute

# In-memory store for rate limiting: ip -> list of timestamps
ip_requests = defaultdict(list)

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. CORS Preflight bypass
        if request.method == "OPTIONS":
            return await call_next(request)

        # 2. Public Routes bypass
        path = request.url.path
        if path in ["/health", "/ai-status", "/docs", "/openapi.json"]:
            return await call_next(request)

        # 3. Rate Limiting
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean old timestamps
        ip_requests[client_ip] = [t for t in ip_requests[client_ip] if now - t < RATE_LIMIT_DURATION]
        
        if len(ip_requests[client_ip]) >= RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Rate limit exceeded."}
            )
        
        ip_requests[client_ip].append(now)

        response = await call_next(request)
        return response
