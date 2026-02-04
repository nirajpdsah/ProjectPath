from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ActivityBase(BaseModel):
    activityId: str
    name: str
    predecessors: Optional[str] = None
    duration: Optional[float] = None
    optimistic: Optional[float] = None
    mostLikely: Optional[float] = None
    pessimistic: Optional[float] = None
    cost: Optional[float] = None
    crashTime: Optional[float] = None
    crashCost: Optional[float] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: str
    projectId: str
    es: Optional[float] = None
    ef: Optional[float] = None
    ls: Optional[float] = None
    lf: Optional[float] = None
    slack: Optional[float] = None
    isCritical: bool = False

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    method: str  # CPM or PERT
    timeUnit: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    activities: List[Activity] = []

    class Config:
        from_attributes = True

class ProjectAnalysisResponse(BaseModel):
    projectDuration: float
    criticalPath: List[str]
    activities: List[Activity]
    projectVariance: Optional[float] = None

class ProbabilityRequest(BaseModel):
    deadline: float

class ProbabilityResponse(BaseModel):
    probability: float
    zscore: float
    stdDeviation: float
