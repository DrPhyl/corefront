from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Framework(str, Enum):
    REACT = "react"
    VUE = "vue"
    SVELTE = "svelte"
    NEXTJS = "nextjs"
    FASTAPI = "fastapi"


class ProjectStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=5000, description="Description of the app to generate")
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    framework: Framework = Field(default=Framework.REACT, description="Target framework")


class RegenerateRequest(BaseModel):
    project_id: int
    prompt: str


class GenerateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    prompt: str
    framework: Framework
    status: ProjectStatus
    generated_code: str | None = None
    error_message: str | None = None
    created_at: datetime


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    prompt: str
    framework: Framework
    status: ProjectStatus
    generated_code: str | None = None
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
