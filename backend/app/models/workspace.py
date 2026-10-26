from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from app.db.session import Base

class WorkspaceModel(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    owner_email = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RequirementRecord(Base):
    __tablename__ = "requirements"

    id = Column(String, primary_key=True, index=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    actor = Column(String, default="User")
    behavior = Column(Text, nullable=False)
    status = Column(String, default="active")

class TestCaseRecord(Base):
    __tablename__ = "test_cases"

    id = Column(String, primary_key=True, index=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="Functional")
    priority = Column(String, default="Medium")
    script = Column(Text, default="")