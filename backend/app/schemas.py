from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    severity: str
    category: str
    file: str
    line: int
    evidence: str
    recommendation: str
    method: str


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action: str
    created_at: datetime


class ProjectOut(BaseModel):
    id: str
    name: str
    source_kind: str
    analyzed: bool
    approved: bool
    applied: bool
    findings: list[FindingOut]
    events: list[EventOut]
