import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.workspaces import router as workspaces_router  # <-- Added
from app.api.documents import router as documents_router
from app.api.generate import router as generate_router
from app.api.execution import router as execution_router

app = FastAPI(title="TestForge AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/reports", StaticFiles(directory=REPORTS_DIR, html=True), name="reports")

# Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(workspaces_router, prefix="/api/v1/workspaces", tags=["workspaces"])  # <-- Added
app.include_router(documents_router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(generate_router, prefix="/api/v1/generate", tags=["generate"])
app.include_router(execution_router, prefix="/api/v1/execute", tags=["execution"])

@app.get("/")
def read_root():
    return {"message": "TestForge AI Backend running live"}