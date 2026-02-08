from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: str
    createdAt: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Activity schemas
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
    method: str  # CPM, PERT, or Crashing
    timeUnit: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime
    activities: List[Activity] = []

    class Config:
        from_attributes = True

class AdhocAnalysisRequest(BaseModel):
    method: str
    timeUnit: str
    activities: List[ActivityBase]

class AdhocProbabilityRequest(BaseModel):
    method: str
    timeUnit: str
    deadline: float
    activities: List[ActivityBase]

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
