import json

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .analysis import findings_for, read_demo_sources
from .database import Base, engine, get_db
from .models import AuditEvent, Finding, Project, Workspace
from .schemas import ProjectOut

Base.metadata.create_all(bind=engine)
app = FastAPI(title="ModernizeAI API", version="0.1.0", description="Deterministic, bundled-sample modernization demo API.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

PROJECT_ID = "legacy-inventory"
PATCH_BEFORE = "    public int getQuantity() { return quantity; }\n    public int getReorderPoint() { return reorderPoint; }"
PATCH_AFTER = (
    "    public int getQuantity() { return quantity; }\n\n"
    "    public boolean isLowStock() {\n"
    "        return quantity <= reorderPoint;\n"
    "    }\n\n"
    "    public int getReorderPoint() { return reorderPoint; }"
)


def ensure_demo(db: Session) -> Project:
    project = db.get(Project, PROJECT_ID)
    if project is None:
        project = Project(id=PROJECT_ID, name="LegacyInventory", source_kind="bundled-demo")
        db.add(project)
        db.add(Workspace(project_id=PROJECT_ID, source_json=json.dumps(read_demo_sources())))
        db.commit()
        db.refresh(project)
    return project


def load_project(db: Session) -> Project:
    ensure_demo(db)
    return db.scalar(
        select(Project)
        .where(Project.id == PROJECT_ID)
        .options(selectinload(Project.findings), selectinload(Project.events))
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "deterministic-demo"}


@app.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    if project_id != PROJECT_ID:
        raise HTTPException(status_code=404, detail="Only the bundled demo project is available.")
    return load_project(db)


@app.post("/api/projects/{project_id}/analyze", response_model=ProjectOut)
def analyze_project(project_id: str, db: Session = Depends(get_db)):
    if project_id != PROJECT_ID:
        raise HTTPException(status_code=404, detail="Only the bundled demo project can be analyzed.")
    project = ensure_demo(db)
    sources = json.loads(db.get(Workspace, PROJECT_ID).source_json)
    db.query(Finding).filter(Finding.project_id == PROJECT_ID).delete()
    for finding in findings_for(sources):
        db.add(Finding(project_id=PROJECT_ID, **finding))
    project.analyzed = True
    db.add(AuditEvent(project_id=PROJECT_ID, action="Deterministic source analysis completed"))
    db.commit()
    return load_project(db)


@app.post("/api/projects/{project_id}/approve", response_model=ProjectOut)
def approve_patch(project_id: str, db: Session = Depends(get_db)):
    if project_id != PROJECT_ID:
        raise HTTPException(status_code=404, detail="Only the bundled demo project is available.")
    project = ensure_demo(db)
    if not project.analyzed:
        raise HTTPException(status_code=409, detail="Run analysis before approving a proposal.")
    if project.applied:
        raise HTTPException(status_code=409, detail="The demo patch has already been applied.")
    project.approved = True
    db.add(AuditEvent(project_id=PROJECT_ID, action="Human approved the scoped refactoring proposal"))
    db.commit()
    return load_project(db)


@app.post("/api/projects/{project_id}/apply", response_model=ProjectOut)
def apply_patch(project_id: str, db: Session = Depends(get_db)):
    if project_id != PROJECT_ID:
        raise HTTPException(status_code=404, detail="Only the bundled demo project is available.")
    project = ensure_demo(db)
    if not project.approved:
        raise HTTPException(status_code=403, detail="Human approval is required before applying the patch.")
    if project.applied:
        raise HTTPException(status_code=409, detail="The demo patch has already been applied.")
    workspace = db.get(Workspace, PROJECT_ID)
    sources = json.loads(workspace.source_json)
    product_path = next((path for path in sources if path.endswith("/Product.java")), None)
    if not product_path or PATCH_BEFORE not in sources[product_path]:
        raise HTTPException(status_code=409, detail="The expected Product.java patch context was not found.")
    sources[product_path] = sources[product_path].replace(PATCH_BEFORE, PATCH_AFTER, 1)
    workspace.source_json = json.dumps(sources)
    project.applied = True
    db.add(AuditEvent(project_id=PROJECT_ID, action="Approved Product.java change applied to persistent demo workspace"))
    db.commit()
    return load_project(db)


@app.post("/api/projects/{project_id}/reset", response_model=ProjectOut)
def reset_demo(project_id: str, db: Session = Depends(get_db)):
    if project_id != PROJECT_ID:
        raise HTTPException(status_code=404, detail="Only the bundled demo project can be reset.")
    project = ensure_demo(db)
    project.analyzed = False
    project.approved = False
    project.applied = False
    db.query(Finding).filter(Finding.project_id == PROJECT_ID).delete()
    db.query(AuditEvent).filter(AuditEvent.project_id == PROJECT_ID).delete()
    workspace = db.get(Workspace, PROJECT_ID)
    workspace.source_json = json.dumps(read_demo_sources())
    db.commit()
    return load_project(db)
