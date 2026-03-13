from sqlalchemy.orm import Session

from app.models.project import Project, ProjectStatus, Framework
from app.schemas.project import GenerateRequest
from app.services.claude import generate_code


def create_project(db: Session, user_id: int, request: GenerateRequest) -> Project:
    """Create a new project."""
    project = Project(
        user_id=user_id,
        name=request.name,
        prompt=request.prompt,
        framework=Framework(request.framework.value),
        status=ProjectStatus.PENDING,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def generate_project_code(db: Session, project: Project) -> Project:
    """Generate code for a project using Claude AI."""
    project.status = ProjectStatus.GENERATING
    db.commit()

    try:
        generated_code = generate_code(project.prompt, project.framework.value)
        project.generated_code = generated_code
        project.status = ProjectStatus.COMPLETED
    except Exception as e:
        project.status = ProjectStatus.FAILED
        project.error_message = str(e)

    db.commit()
    db.refresh(project)
    return project


def get_project_by_id(db: Session, project_id: int, user_id: int) -> Project | None:
    """Get a project by ID for a specific user."""
    return db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id
    ).first()


def get_user_projects(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> list[Project]:
    """Get all projects for a user."""
    return db.query(Project).filter(
        Project.user_id == user_id
    ).order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
