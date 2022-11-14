from base64 import urlsafe_b64encode

from authlib.integrations.starlette_client import OAuth

from myapp.cache import SimpleCache
from myapp.config import NOOK_CLIENT_SECRET, config

# This cache is NOT suitable for production. It is only being used here
# because Authlib would otherwise store the authentication state in the
# session cookie, which have limited storage. We're already storing the
# auth tokens in the cookie, because this example has no database.
# In production, remove this cache or replace it with something like
# Redis.
cache = SimpleCache()
oauth = OAuth(config, cache=cache)

oauth.register(
    "nook",
    client_kwargs={
        "scope": "openid profile email offline_access",
    },
    server_metadata_url="https://partner-auth.zuplo.app/.well-known/openid-configuration",
    jwks={
        "keys": [
            {
                "kid": None,
                "kty": "oct",
                "alg": "HS256",
                "k": urlsafe_b64encode(NOOK_CLIENT_SECRET.encode("utf-8")),
                "use": "sig",
            }
        ]
    },
)
