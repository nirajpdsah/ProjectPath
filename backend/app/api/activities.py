from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Project, Activity, User
from app.schemas.schemas import Activity as ActivitySchema, ActivityCreate
from app.auth import get_current_user

router = APIRouter()

@router.get("/{project_id}/activities", response_model=List[ActivitySchema])
async def get_activities(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all activities for a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    activities = db.query(Activity).filter(Activity.projectId == project_id).all()
    return activities

@router.post("/{project_id}/activities", response_model=ActivitySchema)
async def create_activity(
    project_id: str, 
    activity: ActivityCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity for a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if activity ID already exists
    existing = db.query(Activity).filter(
        Activity.projectId == project_id,
        Activity.activityId == activity.activityId
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Activity ID already exists")
    
    db_activity = Activity(
        projectId=project_id,
        activityId=activity.activityId,
        name=activity.name,
        predecessors=activity.predecessors,
        duration=activity.duration,
        optimistic=activity.optimistic,
        mostLikely=activity.mostLikely,
        pessimistic=activity.pessimistic,
        cost=activity.cost,
        crashTime=activity.crashTime,
        crashCost=activity.crashCost
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.put("/{project_id}/activities/{activity_id}", response_model=ActivitySchema)
async def update_activity(
    project_id: str,
    activity_id: str,
    activity_update: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_activity = db.query(Activity).filter(
        Activity.projectId == project_id,
        Activity.id == activity_id
    ).first()
    
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db_activity.name = activity_update.name
    db_activity.predecessors = activity_update.predecessors
    db_activity.duration = activity_update.duration
    db_activity.optimistic = activity_update.optimistic
    db_activity.mostLikely = activity_update.mostLikely
    db_activity.pessimistic = activity_update.pessimistic
    db_activity.cost = activity_update.cost
    db_activity.crashTime = activity_update.crashTime
    db_activity.crashCost = activity_update.crashCost
    
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/{project_id}/activities/{activity_id}")
async def delete_activity(
    project_id: str,
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_activity = db.query(Activity).filter(
        Activity.projectId == project_id,
        Activity.id == activity_id
    ).first()
    
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"message": "Activity deleted successfully"}
