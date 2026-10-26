from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.ai_service import ai_service

router = APIRouter(prefix="/generate", tags=["generate"])

class ExtractRequest(BaseModel):
    extracted_text: str

class StrategyRequest(BaseModel):
    requirements: List[Dict[str, Any]]

@router.post("/extract-requirements")
async def extract_requirements(payload: ExtractRequest):
    if not payload.extracted_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text cannot be empty.")
    
    requirements = await ai_service.extract_requirements(payload.extracted_text)
    return {"requirements": requirements}

@router.post("/synthesize-suite")
async def synthesize_suite(payload: StrategyRequest):
    if not payload.requirements:
        raise HTTPException(status_code=400, detail="Requirements list cannot be empty.")
    
    suite = await ai_service.generate_test_strategy_and_cases(payload.requirements)
    return suite