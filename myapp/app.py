import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from myapp import config
from myapp.routers import auth, proxy

logging.getLogger().setLevel(logging.INFO)

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=config.SECRET_KEY, https_only=False)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.include_router(auth.router)
app.include_router(proxy.router)
