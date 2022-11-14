import logging
from urllib.parse import urljoin

import requests
from fastapi import APIRouter, Depends, Request, Response
from myapp import config
from myapp.dependencies import access_token

router = APIRouter(prefix="/proxy", tags=["Proxy"])


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
async def proxy(request: Request, path: str, access_token=Depends(access_token)):
    """
    Proxy any calls to the Nook API with the access token set.

    This endpoint shows an example of the access token being used to
    call the Nook API. A proxy endpoint itself is unlikely to be
    useful in your own projects.
    """
    url = urljoin(config.NOOK_API_URL, path)
    logging.info("Proxying to URL: %s", url)
    kwargs = {}
    try:
        kwargs["json"] = await request.json()
    except:
        pass
    response = requests.request(
        request.method,
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        **kwargs,
    )
    return Response(response.text, status_code=response.status_code)
