from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api import projects, activities, analysis
from app.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProjectPath API",
    description="PERT/CPM Project Analyzer API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Include routers
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activities.router, prefix="/projects", tags=["activities"])
app.include_router(analysis.router, prefix="/projects", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "message": "ProjectPath API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
