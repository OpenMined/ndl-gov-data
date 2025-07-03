# Standard library imports
from typing import Optional

# Third-party imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Local imports
from .api import api_router
from .config import get_settings


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


app = FastAPI(
    title="Farming Coop SyftBox App",
    description="API for managing farming cooperative datasets and jobs",
    version=get_settings().app_version,
    debug=get_settings().debug,
    responses={
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
        400: {"model": ErrorResponse, "description": "Bad Request"},
    },
)
if get_settings().debug:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router)
app.mount("/", StaticFiles(directory="frontend/out", html=True, check_dir=False))
