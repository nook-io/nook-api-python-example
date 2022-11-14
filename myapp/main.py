import uvicorn

from myapp.app import app

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8080,
        proxy_headers=True,
        forwarded_allow_ips="*",
        workers=1,
        reload=True,
        debug=True,
    )
