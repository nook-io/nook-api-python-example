from typing import Optional

from fastapi import HTTPException, Request, status


def access_token(request: Request) -> str:
    if (
        "tokens" not in request.session
        or "access_token" not in request.session["tokens"]
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)
    return request.session["tokens"]["access_token"]


def refresh_token(request: Request) -> Optional[str]:
    if "tokens" not in request.session:
        return None
    return request.session["tokens"].get("refresh_token")
