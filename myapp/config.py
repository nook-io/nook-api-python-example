from typing import Optional

from starlette.config import Config

config = Config("myapp/.env")
CORS_ORIGINS: list[str] = config.get("CORS_ORIGINS", default=["http://localhost:4000"])
SECRET_KEY: str = config.get("SECRET_KEY")
NOOK_CLIENT_ID: str = config.get("NOOK_CLIENT_ID")
NOOK_CLIENT_SECRET: str = config.get("NOOK_CLIENT_SECRET")
NOOK_API_URL: str = config.get("NOOK_API_URL")
