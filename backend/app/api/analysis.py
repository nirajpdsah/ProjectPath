from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Project, Activity, User
from app.schemas.schemas import ProjectAnalysisResponse, ProbabilityRequest, ProbabilityResponse, AdhocAnalysisRequest, AdhocProbabilityRequest
from app.services.pert_cpm import PERTCPMEngine, calculate_probability
from app.services.pdf_export import generate_pdf_export
from app.auth import get_current_user
import json
from io import BytesIO
from datetime import datetime

router = APIRouter()

@router.post("/analyze-adhoc", response_model=ProjectAnalysisResponse)
async def analyze_adhoc(request: AdhocAnalysisRequest):
    """Analyze activities without saving (guest mode)"""
    activities_data = []
    for activity in request.activities:
        activities_data.append({
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        })

    try:
        engine = PERTCPMEngine(activities_data)
        result = engine.analyze()

        activities = []
        for activity in request.activities:
            analysis_data = result['activities'].get(activity.activityId, {})
            activities.append({
                'id': activity.activityId,
                'projectId': 'adhoc',
                'activityId': activity.activityId,
                'name': activity.name,
                'predecessors': activity.predecessors,
                'duration': activity.duration,
                'optimistic': activity.optimistic,
                'mostLikely': activity.mostLikely,
                'pessimistic': activity.pessimistic,
                'cost': activity.cost,
                'crashTime': activity.crashTime,
                'crashCost': activity.crashCost,
                'es': analysis_data.get('ES'),
                'ef': analysis_data.get('EF'),
                'ls': analysis_data.get('LS'),
                'lf': analysis_data.get('LF'),
                'slack': analysis_data.get('slack'),
                'isCritical': analysis_data.get('isCritical', False)
            })

        return ProjectAnalysisResponse(
            projectDuration=result['projectDuration'],
            criticalPath=result['criticalPath'],
            activities=activities,
            projectVariance=result['projectVariance']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Adhoc analysis failed: {str(e)}")

@router.post("/analyze-adhoc/probability", response_model=ProbabilityResponse)
async def calculate_adhoc_probability(request: AdhocProbabilityRequest):
    """Calculate probability for adhoc analysis (guest mode)"""
    if request.method != "PERT":
        raise HTTPException(status_code=400, detail="Probability analysis only available for PERT projects")

    activities_data = []
    for activity in request.activities:
        activities_data.append({
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        })

    try:
        engine = PERTCPMEngine(activities_data)
        result = engine.analyze()
        project_duration = result['projectDuration']
        project_variance = result['projectVariance'] or 0
        calc = calculate_probability(project_duration, project_variance, request.deadline)
        return ProbabilityResponse(**calc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Probability calculation failed: {str(e)}")

@router.post("/analyze-adhoc/crashing")
async def analyze_adhoc_crashing(request: AdhocAnalysisRequest):
    """Calculate crashing options for adhoc analysis (guest mode)"""
    activities_data = []
    for activity in request.activities:
        activities_data.append({
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        })

    try:
        engine = PERTCPMEngine(activities_data)
        result = engine.calculate_crashing_options()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crashing analysis failed: {str(e)}")

@router.post("/export-adhoc")
async def export_adhoc_analysis(request: AdhocAnalysisRequest, format: str = "json"):
    """Export analysis for guest users without authentication"""
    activities_data = []
    for activity in request.activities:
        activities_data.append({
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        })

    try:
        # Perform analysis
        engine = PERTCPMEngine(activities_data)
        analysis_result = engine.analyze()
        
        # Build export data structure
        export_data = {
            "metadata": {
                "projectId": "guest-project",
                "projectName": "Guest Project",
                "method": request.method,
                "timeUnit": request.timeUnit,
                "exportDate": datetime.utcnow().isoformat(),
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            },
            "problem": {
                "description": f"Project scheduling using {request.method} method",
                "activities": [
                    {
                        "activityId": a.activityId,
                        "name": a.name,
                        "predecessors": a.predecessors or "None",
                        "duration": a.duration,
                        "optimistic": a.optimistic,
                        "mostLikely": a.mostLikely,
                        "pessimistic": a.pessimistic,
                        "cost": a.cost,
                        "crashTime": a.crashTime,
                        "crashCost": a.crashCost
                    }
                    for a in request.activities
                ],
                "objectives": [
                    "Determine project completion time",
                    "Identify critical path",
                    "Calculate activity slack times",
                    "Optimize resource allocation"
                ]
            },
            "solution": {
                "projectDuration": analysis_result['projectDuration'],
                "projectVariance": analysis_result['projectVariance'],
                "criticalPath": analysis_result['criticalPath'],
                "activities": [
                    {
                        "activityId": act_id,
                        "ES": act_data['ES'],
                        "EF": act_data['EF'],
                        "LS": act_data['LS'],
                        "LF": act_data['LF'],
                        "slack": act_data['slack'],
                        "isCritical": act_data['isCritical'],
                        "duration": act_data.get('duration', 0),
                        "variance": act_data.get('variance', 0)
                    }
                    for act_id, act_data in analysis_result['activities'].items()
                ],
                "criticalActivitiesCount": len([a for a in analysis_result['activities'].values() if a['isCritical']]),
                "totalActivities": len(request.activities),
                "analysis": {
                    "method": request.method,
                    "timeUnit": request.timeUnit,
                    "criticalPathLength": len(analysis_result['criticalPath']),
                    "standardDeviation": (analysis_result['projectVariance'] ** 0.5) if analysis_result['projectVariance'] else None
                }
            }
        }
        
        # Try to get crashing analysis if available
        try:
            crashing_result = engine.calculate_crashing_options()
            export_data["solution"]["crashing"] = crashing_result
        except:
            pass
        
        # Return based on format
        if format.lower() == "pdf":
            # Generate PDF
            try:
                pdf_buffer = generate_pdf_export(export_data)
                filename = f"guest_project_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
                
                return StreamingResponse(
                    pdf_buffer,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}"
                    }
                )
            except Exception as pdf_error:
                # If PDF generation fails, return error with details
                import traceback
                error_detail = f"PDF generation failed: {str(pdf_error)}\n{traceback.format_exc()}"
                print(error_detail)  # Log to console
                raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(pdf_error)}")
        else:
            # Return as JSON (default)
            filename = f"guest_project_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_detail = f"Export failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Log to console
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/{project_id}/analyze", response_model=ProjectAnalysisResponse)
async def analyze_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze a project and calculate PERT/CPM values"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    activities = db.query(Activity).filter(Activity.projectId == project_id).all()
    if not activities:
        raise HTTPException(status_code=400, detail="Project has no activities")
    
    # Convert activities to dict format for engine
    activities_data = []
    for activity in activities:
        activity_dict = {
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        }
        activities_data.append(activity_dict)
    
    try:
        # Perform analysis
        engine = PERTCPMEngine(activities_data)
        result = engine.analyze()
        
        # Update database with calculated values
        for activity_id, activity_data in result['activities'].items():
            db_activity = db.query(Activity).filter(
                Activity.projectId == project_id,
                Activity.activityId == activity_id
            ).first()
            
            if db_activity:
                db_activity.es = activity_data.get('ES')
                db_activity.ef = activity_data.get('EF')
                db_activity.ls = activity_data.get('LS')
                db_activity.lf = activity_data.get('LF')
                db_activity.slack = activity_data.get('slack')
                db_activity.isCritical = activity_data.get('isCritical', False)
        
        db.commit()
        
        # Fetch updated activities
        updated_activities = db.query(Activity).filter(Activity.projectId == project_id).all()
        
        return ProjectAnalysisResponse(
            projectDuration=result['projectDuration'],
            criticalPath=result['criticalPath'],
            activities=updated_activities,
            projectVariance=result['projectVariance']
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/{project_id}/probability", response_model=ProbabilityResponse)
async def calculate_project_probability(
    project_id: str,
    request: ProbabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate probability of completing by deadline"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.method != "PERT":
        raise HTTPException(status_code=400, detail="Probability analysis only available for PERT projects")
    
    activities = db.query(Activity).filter(Activity.projectId == project_id).all()
    if not activities:
        raise HTTPException(status_code=400, detail="Project has no activities")
    
    # Get project duration and variance from critical activities
    project_duration = max((a.ef for a in activities if a.ef is not None), default=0)
    
    # Calculate variance only for critical activities with three-point estimates
    project_variance = 0
    for activity in activities:
        if activity.isCritical and activity.pessimistic is not None and activity.optimistic is not None:
            # Variance = ((Pessimistic - Optimistic) / 6)^2
            variance = ((activity.pessimistic - activity.optimistic) / 6.0) ** 2
            project_variance += variance
    
    try:
        result = calculate_probability(project_duration, project_variance, request.deadline)
        return ProbabilityResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Probability calculation failed: {str(e)}")

@router.get("/{project_id}/crashing")
async def get_crashing_analysis(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate project crashing options (time-cost tradeoff)"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    activities = db.query(Activity).filter(Activity.projectId == project_id).all()
    if not activities:
        raise HTTPException(status_code=400, detail="Project has no activities")
    
    # Convert activities to dict format for engine
    activities_data = []
    for activity in activities:
        activity_dict = {
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        }
        activities_data.append(activity_dict)
    
    try:
        engine = PERTCPMEngine(activities_data)
        result = engine.calculate_crashing_options()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crashing analysis failed: {str(e)}")


@router.get("/{project_id}/export")
async def export_analysis(
    project_id: str,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export complete project analysis including problem definition and solution
    
    Args:
        project_id: The project ID to export
        format: Export format - 'json' or 'pdf' (default: 'json')
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.userId == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    activities = db.query(Activity).filter(Activity.projectId == project_id).all()
    if not activities:
        raise HTTPException(status_code=400, detail="Project has no activities")
    
    # Convert activities to dict format for engine
    activities_data = []
    for activity in activities:
        activity_dict = {
            'activityId': activity.activityId,
            'name': activity.name,
            'predecessors': activity.predecessors or '',
            'duration': activity.duration,
            'optimistic': activity.optimistic,
            'mostLikely': activity.mostLikely,
            'pessimistic': activity.pessimistic,
            'cost': activity.cost,
            'crashTime': activity.crashTime,
            'crashCost': activity.crashCost
        }
        activities_data.append(activity_dict)
    
    try:
        # Perform analysis
        engine = PERTCPMEngine(activities_data)
        analysis_result = engine.analyze()
        
        # Build export data structure
        export_data = {
            "metadata": {
                "projectId": project.id,
                "projectName": project.name,
                "method": project.method,
                "timeUnit": project.timeUnit,
                "exportDate": datetime.utcnow().isoformat(),
                "createdAt": project.createdAt.isoformat(),
                "updatedAt": project.updatedAt.isoformat()
            },
            "problem": {
                "description": f"Project scheduling using {project.method} method",
                "activities": [
                    {
                        "activityId": a.activityId,
                        "name": a.name,
                        "predecessors": a.predecessors or "None",
                        "duration": a.duration,
                        "optimistic": a.optimistic,
                        "mostLikely": a.mostLikely,
                        "pessimistic": a.pessimistic,
                        "cost": a.cost,
                        "crashTime": a.crashTime,
                        "crashCost": a.crashCost
                    }
                    for a in activities
                ],
                "objectives": [
                    "Determine project completion time",
                    "Identify critical path",
                    "Calculate activity slack times",
                    "Optimize resource allocation"
                ]
            },
            "solution": {
                "projectDuration": analysis_result['projectDuration'],
                "projectVariance": analysis_result['projectVariance'],
                "criticalPath": analysis_result['criticalPath'],
                "activities": [
                    {
                        "activityId": act_id,
                        "ES": act_data['ES'],
                        "EF": act_data['EF'],
                        "LS": act_data['LS'],
                        "LF": act_data['LF'],
                        "slack": act_data['slack'],
                        "isCritical": act_data['isCritical'],
                        "duration": act_data.get('duration', 0),
                        "variance": act_data.get('variance', 0)
                    }
                    for act_id, act_data in analysis_result['activities'].items()
                ],
                "criticalActivitiesCount": len([a for a in analysis_result['activities'].values() if a['isCritical']]),
                "totalActivities": len(activities),
                "analysis": {
                    "method": project.method,
                    "timeUnit": project.timeUnit,
                    "criticalPathLength": len(analysis_result['criticalPath']),
                    "standardDeviation": (analysis_result['projectVariance'] ** 0.5) if analysis_result['projectVariance'] else None
                }
            }
        }
        
        # Try to get crashing analysis if available
        try:
            crashing_result = engine.calculate_crashing_options()
            export_data["solution"]["crashing"] = crashing_result
        except:
            pass
        
        # Return based on format
        if format.lower() == "pdf":
            # Generate PDF
            pdf_buffer = generate_pdf_export(export_data)
            filename = f"project_analysis_{project.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            return StreamingResponse(
                pdf_buffer,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        else:
            # Return as JSON (default)
            filename = f"project_analysis_{project.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
