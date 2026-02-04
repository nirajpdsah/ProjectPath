# ProjectPath - Architecture & Technical Details

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
├─────────────────────────────────────────────────────────────┤
│                    React 18 + TypeScript                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Frontend Application                    │    │
│  │  • Dashboard          • Project Editor              │    │
│  │  • Analysis View      • Activity Management          │    │
│  │  • Probability Calc   • Project List                │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓ HTTP/REST                         │
├─────────────────────────────────────────────────────────────┤
│                      Proxy Layer (Vite)                      │
├─────────────────────────────────────────────────────────────┤
│                    FastAPI Backend Server                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Core API Routes                          │     │
│  │  • /projects          • /activities               │     │
│  │  • /analyze           • /probability              │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │      PERT/CPM Algorithm Engine                    │     │
│  │  • Graph Validation    • Forward Pass             │     │
│  │  • Backward Pass       • Critical Path Finding    │     │
│  │  • Slack Calculation   • Probability Analysis     │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↓ SQLAlchemy ORM                    │
├─────────────────────────────────────────────────────────────┤
│                   SQLite / PostgreSQL                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Projects Table        Activities Table            │     │
│  │  • id                  • id                        │     │
│  │  • name                • projectId (FK)            │     │
│  │  • method              • activityId                │     │
│  │  • timeUnit            • name                      │     │
│  │  • timestamps          • predecessors             │     │
│  │                        • duration / PERT times     │     │
│  │                        • ES, EF, LS, LF           │     │
│  │                        • slack, isCritical        │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18**: Component-based UI
- **TypeScript**: Type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS styling
- **Axios**: HTTP client for API calls
- **React Router v6**: Client-side routing
- **Recharts**: Data visualization (future enhancement)

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation header
│   │   ├── ProjectList.tsx      # Display projects
│   │   └── CreateProjectForm.tsx # Create project form
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── ProjectEditor.tsx    # Activity management
│   │   └── AnalysisView.tsx     # Analysis results
│   ├── services/
│   │   └── api.ts              # Axios instance for API calls
│   ├── utils/                  # Utility functions
│   ├── store/                  # State management (Zustand ready)
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### Key Components

#### Navbar
- Navigation header with ProjectPath branding
- Links to dashboard

#### CreateProjectForm
- Form for creating new projects
- Validates project name, method, and time unit
- Triggers list refresh on successful creation

#### ProjectList
- Fetches and displays all projects
- Shows project details (method, time unit)
- Links to project editor

#### ProjectEditor
- Manages project activities
- Supports adding activities with:
  - CPM: Single duration
  - PERT: Optimistic, most likely, pessimistic
- Delete activities
- Navigate to analysis

#### AnalysisView
- Displays analysis results
- Shows key metrics (duration, critical path)
- Activity schedule table with ES, EF, LS, LF, slack
- Probability calculator (PERT)

## Backend Architecture

### Technology Stack
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database
- **Pydantic**: Data validation
- **NumPy/SciPy**: Scientific computations
- **SQLite/PostgreSQL**: Persistent storage

### Project Structure
```
backend/
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── app/
│   ├── __init__.py
│   ├── database.py         # Database configuration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── projects.py     # Project endpoints
│   │   ├── activities.py   # Activity endpoints
│   │   └── analysis.py     # Analysis endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py       # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py      # Pydantic schemas
│   └── services/
│       ├── __init__.py
│       └── pert_cpm.py     # Core algorithm engine
└── Dockerfile
```

### Core Algorithm: PERTCPMEngine

#### Class: PERTCPMEngine

**Purpose**: Implements PERT/CPM calculations

**Key Methods**:

1. **`__init__(activities_data)`**
   - Initializes with activity data
   - Builds project network graph
   - Creates adjacency lists for traversal

2. **`validate_dag()`**
   - Checks for cycles using DFS
   - Returns True if valid DAG, False if cycles exist
   - Uses recursive stack to detect back edges

3. **`get_duration(activity_id)`**
   - Returns duration for CPM projects
   - Calculates expected time for PERT: `t = (a + 4m + b) / 6`
   - Returns float value

4. **`get_variance(activity_id)`**
   - Calculates variance for PERT: `σ² = ((b - a) / 6)²`
   - Used in probability calculations

5. **`forward_pass()`**
   - **Earliest Start (ES)**: Latest EF of predecessors
   - **Earliest Finish (EF)**: ES + Duration
   - Uses topological sort via BFS
   - Returns dict with ES, EF for all activities

6. **`backward_pass(project_duration)`**
   - **Latest Finish (LF)**: Minimum LS of successors
   - **Latest Start (LS)**: LF - Duration
   - Reverse topological sort via BFS
   - Returns dict with LS, LF for all activities

7. **`analyze()`**
   - Orchestrates complete analysis
   - Calls forward pass, backward pass
   - Calculates slack: `Slack = LS - ES`
   - Identifies critical activities (slack ≈ 0)
   - Returns project duration, critical path, activities data

8. **`find_critical_path(critical_activities)`**
   - Traces path from start through critical activities
   - Returns ordered list of activity IDs
   - Handles multiple critical paths

#### Probability Calculation

```python
def calculate_probability(project_duration, project_variance, deadline):
    std_deviation = sqrt(project_variance)
    z_score = (deadline - project_duration) / std_deviation
    probability = Φ(z_score)  # CDF of standard normal
    return {probability, z_score, std_deviation}
```

Uses `scipy.stats.norm.cdf()` for normal distribution

### API Endpoints

#### Projects Router (`/projects`)
```
GET    /                      List all projects
POST   /                      Create new project
GET    /{project_id}          Get project details
PUT    /{project_id}          Update project
DELETE /{project_id}          Delete project
```

#### Activities Router (`/projects/{project_id}/activities`)
```
GET    /                      List activities
POST   /                      Create activity
PUT    /{activity_id}         Update activity
DELETE /{activity_id}         Delete activity
```

#### Analysis Router (`/projects/{project_id}`)
```
GET    /analyze               Perform PERT/CPM analysis
POST   /probability           Calculate completion probability
```

### Data Models

#### Project Model
```python
class Project(Base):
    id: str              # UUID
    name: str
    method: str          # "CPM" or "PERT"
    timeUnit: str        # "days", "weeks", "months"
    createdAt: datetime
    updatedAt: datetime
    activities: List[Activity]  # Relationship
```

#### Activity Model
```python
class Activity(Base):
    id: str                      # UUID
    projectId: str              # FK to Project
    activityId: str             # User-defined ID (e.g., "A1")
    name: str
    predecessors: str           # Comma-separated IDs
    
    # CPM
    duration: float
    
    # PERT
    optimistic: float
    mostLikely: float
    pessimistic: float
    
    # Crashing (optional)
    cost: float
    crashTime: float
    crashCost: float
    
    # Calculated
    es: float               # Earliest Start
    ef: float               # Earliest Finish
    ls: float               # Latest Start
    lf: float               # Latest Finish
    slack: float
    isCritical: bool
```

## Algorithms in Detail

### Forward Pass Algorithm
```
For each activity in topological order:
  if no predecessors:
    ES = 0
  else:
    ES = max(EF of predecessors)
  EF = ES + duration
```

Time Complexity: O(V + E) where V = activities, E = dependencies

### Backward Pass Algorithm
```
For each activity in reverse topological order:
  if no successors:
    LF = project_duration
  else:
    LF = min(LS of successors)
  LS = LF - duration
```

Time Complexity: O(V + E)

### Critical Path Detection
```
Critical activities = {activities where slack ≈ 0}
Critical path = path from start to end through critical activities
```

### Cycle Detection (DAG Validation)
```
Using Depth-First Search with recursion stack:
  visited = {}
  recursion_stack = {}
  
  for each unvisited node:
    if dfs(node) finds back edge:
      return False (cycle found)
  return True (no cycles)
```

## Performance Characteristics

| Operation | Time | Space |
|-----------|------|-------|
| Forward Pass | O(V + E) | O(V) |
| Backward Pass | O(V + E) | O(V) |
| Slack Calc | O(V) | O(1) |
| Critical Path | O(V + E) | O(V) |
| Total Analysis | O(V + E) | O(V + E) |
| DAG Validation | O(V + E) | O(V) |

Where:
- V = number of activities
- E = number of dependencies

**Expected Performance**:
- 100 activities: < 50ms
- 1,000 activities: < 500ms
- 10,000 activities: < 5s

## Security Considerations

### Current Implementation
- No authentication
- No authorization
- CORS enabled for all origins (development)
- SQLite default (not production-ready)

### Production Recommendations
1. **Authentication**: Implement JWT tokens
2. **Authorization**: Role-based access control
3. **Input Validation**: Pydantic handles basic validation
4. **CORS**: Restrict to known origins
5. **Database**: Use PostgreSQL with TLS
6. **API Rate Limiting**: Implement rate limiters
7. **Logging**: Add structured logging
8. **Error Handling**: Don't expose internal errors

## Deployment Options

### Docker Compose (Development)
```bash
docker-compose up
```

### Production
```bash
# Build frontend
cd frontend
npm run build

# Serve with Gunicorn + Uvicorn
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Cloud Deployment
- **Vercel**: Frontend (SPA)
- **Heroku/Railway/Render**: Backend (FastAPI)
- **AWS RDS**: PostgreSQL database
- **S3/CloudFront**: Static assets

## Future Enhancements

### Phase 2
- User authentication & projects
- Resource leveling algorithm
- Gantt chart visualization
- Import/Export (CSV, Excel, PDF)

### Phase 3
- Monte Carlo simulation
- Multi-project portfolio analysis
- Real-time collaboration
- Advanced crashing optimization

### Phase 4
- AI-powered schedule suggestions
- Classroom mode for instructors
- Team management
- Integrations (Jira, Asana, Monday.com)

---

**Architecture Last Updated**: February 2026
