from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db.session import get_db, Base, engine
from app.models.workspace import WorkspaceModel, RequirementRecord, TestCaseRecord

# Ensure SQLite schema tables exist automatically on boot
Base.metadata.create_all(bind=engine)

router = APIRouter()

class WorkspaceCreate(BaseModel):
    id: str
    name: str
    description: str = ""
    owner_email: str

class WorkspaceUpdate(BaseModel):
    name: str
    description: str = ""

class WorkspaceOut(BaseModel):
    id: str
    name: str
    description: str
    owner_email: str
    requirementsCount: int = 0
    testCasesCount: int = 0

    class Config:
        from_attributes = True

@router.get("/", response_model=List[WorkspaceOut])
def list_workspaces(owner_email: str, db: Session = Depends(get_db)):
    items = db.query(WorkspaceModel).filter(WorkspaceModel.owner_email == owner_email.lower().strip()).all()
    out = []
    for item in items:
        r_count = db.query(RequirementRecord).filter(RequirementRecord.workspace_id == item.id).count()
        t_count = db.query(TestCaseRecord).filter(TestCaseRecord.workspace_id == item.id).count()
        out.append(
            WorkspaceOut(
                id=item.id,
                name=item.name,
                description=item.description,
                owner_email=item.owner_email,
                requirementsCount=r_count,
                testCasesCount=t_count,
            )
        )
    return out

@router.post("/", response_model=WorkspaceOut)
def create_workspace(payload: WorkspaceCreate, db: Session = Depends(get_db)):
    existing = db.query(WorkspaceModel).filter(WorkspaceModel.id == payload.id).first()
    if existing:
        return WorkspaceOut(
            id=existing.id,
            name=existing.name,
            description=existing.description,
            owner_email=existing.owner_email,
            requirementsCount=0,
            testCasesCount=0,
        )

    new_ws = WorkspaceModel(
        id=payload.id,
        name=payload.name,
        description=payload.description,
        owner_email=payload.owner_email.lower().strip(),
    )
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    return WorkspaceOut(
        id=new_ws.id,
        name=new_ws.name,
        description=new_ws.description,
        owner_email=new_ws.owner_email,
        requirementsCount=0,
        testCasesCount=0,
    )

@router.put("/{workspace_id}", response_model=WorkspaceOut)
def update_workspace(workspace_id: str, payload: WorkspaceUpdate, db: Session = Depends(get_db)):
    ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    ws.name = payload.name.strip()
    if payload.description:
        ws.description = payload.description.strip()
    
    db.commit()
    db.refresh(ws)

    r_count = db.query(RequirementRecord).filter(RequirementRecord.workspace_id == ws.id).count()
    t_count = db.query(TestCaseRecord).filter(TestCaseRecord.workspace_id == ws.id).count()

    return WorkspaceOut(
        id=ws.id,
        name=ws.name,
        description=ws.description,
        owner_email=ws.owner_email,
        requirementsCount=r_count,
        testCasesCount=t_count,
    )

@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: str, db: Session = Depends(get_db)):
    ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Cascade delete child relations
    db.query(RequirementRecord).filter(RequirementRecord.workspace_id == workspace_id).delete()
    db.query(TestCaseRecord).filter(TestCaseRecord.workspace_id == workspace_id).delete()
    db.delete(ws)
    db.commit()
    return {"message": f"Workspace {workspace_id} successfully deleted from SQLite"}