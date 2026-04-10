from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import api_router

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title = settings.PROJECT_NAME, version =settings.VERSION, openapi_url = f"{settings.API_V1_STR}/openapi.json")

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
        CORSMiddleware,
        allow_origins = settings.CORS_ORIGINS_LIST,
        allow_credentials=True, #autorise cookie et authentification, les tokens jwt seront peut etre dans les cookies , si false il bloque les cookies
        allow_methods=["*"], #autorise get post put delete etc
        allow_headers=["*"] #autorise tout les headers
        )

app.include_router(api_router, prefix = settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
        init_db()

@app.get("/health")
def health_check():
    return {
            "message" : "Auth Service API",
            "version" : settings.VERSION,
            "status" : "running"
            }

