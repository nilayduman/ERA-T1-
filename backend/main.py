import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS
from middleware import SecurityMiddleware
from routers import operations
from storage import store

app = FastAPI(
    title="Era",
    description="AI-powered logistics optimization",
    version="1.0.0",
)

# 1. Startup Event to Initialize SQLite DB
@app.on_event("startup")
async def startup_event():
    await store.init_db()

# 2. CORS Middleware with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Security Middleware (API Key Auth & Rate Limit)
app.add_middleware(SecurityMiddleware)

app.include_router(operations.router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
