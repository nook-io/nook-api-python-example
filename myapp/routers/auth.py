from typing import Optional
from urllib.parse import parse_qs, urlencode, urlparse

from authlib.integrations.base_client.errors import MismatchingStateError
from authlib.integrations.starlette_client import OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import PlainTextResponse, RedirectResponse

from myapp import config
from myapp.dependencies import access_token, refresh_token
from myapp.oauth import oauth

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_response_state(response: RedirectResponse):
    """
    Extract the state parameter from the given RedirectResponse.
    Authlib only exposes the state to us in the redirect response.
    """
    parts = urlparse(response.headers["location"])
    query_params = parse_qs(parts.query)
    return query_params["state"][0]


@router.get("/connect")
async def connect(request: Request):
    redirect_url = request.url_for("callback")
    try:
        response: RedirectResponse = await oauth.nook.authorize_redirect(
            request,
            redirect_url,
            audience="https://api.nook.io",
        )
    except OAuthError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=e.detail) from e
    state = get_response_state(response)
    state_data = await oauth.nook.framework.get_state_data(request.session, state)
    await oauth.nook.framework.set_state_data(
        request.session, state, {**state_data, "return_url": request.headers["referer"]}
    )
    return response


@router.get(
    "/disconnect",
    status_code=status.HTTP_302_FOUND,
)
async def disconnect(request: Request, refresh_token=Depends(refresh_token)):
    """Disconnect the user's integration."""
    redirect_url = str(request.base_url)
    query_string = urlencode(
        {
            "returnTo": redirect_url,
            "client_id": config.NOOK_CLIENT_ID,
        }
    )
    if refresh_token is not None:
        metadata = await oauth.nook.load_server_metadata()
        revocation_endpoint = metadata["revocation_endpoint"]
        async with oauth.nook._get_oauth_client(**metadata) as client:
            await client.revoke_token(revocation_endpoint, token=refresh_token)
    request.session.pop("tokens")
    return RedirectResponse(f"https://partner-auth.zuplo.app/v2/logout?{query_string}")


@router.get("/callback")
async def callback(
    request: Request,
    state: str,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
):
    """
    Authentication callback. Will receive the OAuth authorisation code
    and retrieve the access, refresh and ID tokens.
    """
    if error or error_description:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail=f"{error}: {error_description}"
        )
    try:
        # The tokens are stored in the user session to keep this example
        # simple. You'll probably want to store these tokens against the
        # user instead, so the backend can use it without user
        # interaction.
        state_data = await oauth.nook.framework.get_state_data(request.session, state)
        request.session["tokens"] = await oauth.nook.authorize_access_token(
            request,
        )

    except MismatchingStateError as e:
        # Either malicious tampering or, more likely, the auth state not
        # being stored by Authlib's due to a lack of space in its cache
        # backend.
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Mismatching state, please try logging in again",
        ) from e
    return RedirectResponse(state_data["return_url"])


@router.get("/token", response_class=PlainTextResponse)
async def get_token(access_token=Depends(access_token)):
    """For debugging/example purposes only."""
    return PlainTextResponse(access_token)
