from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.project import GenerateRequest, GenerateResponse, ProjectResponse, RegenerateRequest
from app.services.project import (
    create_project,
    generate_project_code,
    get_project_by_id,
    get_user_projects,
)

router = APIRouter()


@router.post("/", response_model=GenerateResponse, status_code=status.HTTP_201_CREATED)
def generate_code(
    request: GenerateRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Generate code from a prompt using Claude AI."""
    # Create the project
    project = create_project(db, current_user.id, request)

    # Generate the code
    project = generate_project_code(db, project)

    return project


@router.post("/regenerate", response_model=GenerateResponse)
def regenerate_code(
    request: RegenerateRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Regenerate code for an existing project with a new prompt."""
    project = get_project_by_id(db, project_id=request.project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    project.prompt = request.prompt
    db.commit()
    project = generate_project_code(db, project)
    return project


@router.get("/", response_model=list[ProjectResponse])
def list_projects(
    current_user: CurrentUser,
    db: DBSession,
    skip: int = 0,
    limit: int = 20,
):
    """List all projects for the current user."""
    projects = get_user_projects(db, current_user.id, skip=skip, limit=limit)
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    """Get a specific project by ID."""
    project = get_project_by_id(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project
