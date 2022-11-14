# Nook API - OAuth example

This repository contains an example project that implements the
OAuth2 authorisation code flow to obtain an access token for a Nook
company, which can be used with the Nook API.

This backend is implemented in Python and uses the FastAPI web
framework. It is supported by a front-end, written in React using Create
React App.

The example backend has a proxy endpoint that forwards any requests
made to it to the Nook API, inserting the access token that was
retrieved by connecting a Nook company through the example frontend.

## Install

### Backend

To run the backend, you'll need to install Python and the required
packages, which  done with [Poetry](https://python-poetry.org/).

```bash
python3 -m pip install -r requirements.txt
```

A couple of environment variables are required to run the backend, such
as the Nook API client credentials, which can be set in the `.env` file.
First, copy the example environment file.

```bash
cp .env.example .env
```

Now edit `.env`, filling in the `NOOK_CLIENT_ID` and
`NOOK_CLIENT_SECRET` with the client ID and secret from the Nook
developer portal.

### Frontend

```
cd ./myapp-frontend/
npm i
```

## Running

The backend and frontend can be run by running the following script:

```bash
./run.sh
```

The API backend can now be accessed on http://localhost:8080. The
exposed endpoints are documented on http://localhost:8080/redoc.

The frontend can be accessed at http://localhost:4000.
