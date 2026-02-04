from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    method = Column(String, nullable=False)  # CPM or PERT
    timeUnit = Column(String, nullable=False)  # days, weeks, months
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    activities = relationship("Activity", back_populates="project", cascade="all, delete-orphan")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    projectId = Column(String, ForeignKey("projects.id"), nullable=False)
    activityId = Column(String, nullable=False)  # User-defined activity ID
    name = Column(String, nullable=False)
    predecessors = Column(Text, nullable=True)  # Comma-separated
    
    # For CPM
    duration = Column(Float, nullable=True)
    
    # For PERT
    optimistic = Column(Float, nullable=True)
    mostLikely = Column(Float, nullable=True)
    pessimistic = Column(Float, nullable=True)
    
    # Crashing
    cost = Column(Float, nullable=True)
    crashTime = Column(Float, nullable=True)
    crashCost = Column(Float, nullable=True)
    
    # Calculated values
    es = Column(Float, nullable=True)  # Earliest Start
    ef = Column(Float, nullable=True)  # Earliest Finish
    ls = Column(Float, nullable=True)  # Latest Start
    lf = Column(Float, nullable=True)  # Latest Finish
    slack = Column(Float, nullable=True)
    isCritical = Column(Boolean, default=False)

    project = relationship("Project", back_populates="activities")
