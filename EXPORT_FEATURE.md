# Export Analysis Feature

## Overview
The export analysis feature allows users to download a comprehensive JSON file containing both the problem definition and the complete solution for their project analysis. This feature is available in the Analysis View after running a project analysis.

## Features

### What Gets Exported

The exported JSON file includes:

#### 1. **Metadata**
- Project ID
- Project Name
- Analysis Method (CPM or PERT)
- Time Unit
- Export Date & Time
- Project Creation & Update Dates

#### 2. **Problem Definition**
- **Description**: Project scheduling method used
- **Activities**: Complete list of all project activities with:
  - Activity ID
  - Activity Name
  - Predecessors
  - Duration (for CPM)
  - Optimistic, Most Likely, Pessimistic times (for PERT)
  - Cost information
  - Crash time and crash cost
- **Objectives**: List of analysis objectives

#### 3. **Solution**
- **Project Duration**: Total project completion time
- **Project Variance**: Statistical variance (for PERT)
- **Critical Path**: Sequence of critical activities
- **Activity Analysis**: For each activity:
  - Earliest Start (ES)
  - Earliest Finish (EF)
  - Latest Start (LS)
  - Latest Finish (LF)
  - Slack time
  - Critical status
  - Duration
  - Variance
- **Summary Statistics**:
  - Critical activities count
  - Total activities count
  - Critical path length
  - Standard deviation
- **Crashing Analysis**: (if available)
  - Cost-time tradeoff options

## Usage

### Backend Endpoint
```
GET /projects/{project_id}/export
```

**Response**: JSON file with complete analysis data

### Frontend Usage

1. Navigate to the Analysis View for any project
2. Click the **"Export Analysis"** button in the top right corner
3. The file will automatically download with a timestamped filename:
   ```
   project_analysis_YYYY-MM-DD_HHMMSS.json
   ```

### UI Components

The export button features:
- Download icon
- Loading state ("Exporting...")
- Error handling with user feedback
- Disabled state during export

## File Format

### Example Export Structure

```json
{
  "metadata": {
    "projectId": "uuid-string",
    "projectName": "Website Development",
    "method": "PERT",
    "timeUnit": "days",
    "exportDate": "2026-02-04T10:30:00",
    "createdAt": "2026-02-01T08:00:00",
    "updatedAt": "2026-02-04T10:30:00"
  },
  "problem": {
    "description": "Project scheduling using PERT method",
    "activities": [
      {
        "activityId": "A",
        "name": "Design Phase",
        "predecessors": "None",
        "duration": null,
        "optimistic": 3,
        "mostLikely": 5,
        "pessimistic": 7,
        "cost": 1000,
        "crashTime": 4,
        "crashCost": 1500
      }
    ],
    "objectives": [
      "Determine project completion time",
      "Identify critical path",
      "Calculate activity slack times",
      "Optimize resource allocation"
    ]
  },
  "solution": {
    "projectDuration": 45.5,
    "projectVariance": 2.78,
    "criticalPath": ["A", "C", "E", "G"],
    "activities": [
      {
        "activityId": "A",
        "ES": 0,
        "EF": 5,
        "LS": 0,
        "LF": 5,
        "slack": 0,
        "isCritical": true,
        "duration": 5,
        "variance": 0.44
      }
    ],
    "criticalActivitiesCount": 4,
    "totalActivities": 8,
    "analysis": {
      "method": "PERT",
      "timeUnit": "days",
      "criticalPathLength": 4,
      "standardDeviation": 1.67
    },
    "crashing": {
      // Crashing analysis data if available
    }
  }
}
```

## Implementation Details

### Backend (`backend/app/api/analysis.py`)
- New endpoint: `export_analysis(project_id)`
- Performs full project analysis
- Constructs comprehensive export data structure
- Returns JSON with appropriate headers for file download
- Includes error handling for missing projects/activities

### Frontend (`frontend/src/pages/AnalysisView.tsx`)
- New state variable: `exporting`
- New function: `exportAnalysis()`
- Export button with Download icon
- Blob creation and automatic download
- Timestamped filename generation
- Error state handling

## Benefits

1. **Documentation**: Complete record of problem and solution
2. **Portability**: Easy to share analysis results
3. **Archival**: Keep historical records of project analyses
4. **Integration**: JSON format allows easy integration with other tools
5. **Comprehensive**: Includes all relevant data in one file
6. **Automation**: Can be used for automated reporting systems

## Error Handling

The feature includes robust error handling:
- Project not found (404)
- No activities in project (400)
- Analysis calculation errors (500)
- Network/download errors (displayed to user)

## Future Enhancements

Potential improvements:
- PDF export format
- Excel/CSV export
- Custom export templates
- Selective data export (choose what to include)
- Batch export for multiple projects
- Email export functionality
- Cloud storage integration

## Technical Notes

- File format: JSON
- Response type: Blob
- Filename pattern: `project_analysis_{project_name}_{timestamp}.json`
- All dates in ISO format
- Numbers rounded to 2 decimal places where appropriate
- Handles both CPM and PERT methods
- Gracefully handles optional fields (crashing analysis)
