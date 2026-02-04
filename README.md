# ProjectPath - PERT/CPM Project Analyzer

A modern web-based project management tool for analyzing projects using PERT (Program Evaluation and Review Technique) and CPM (Critical Path Method).

## Features

✅ **Project Setup** - Create projects with CPM or PERT methods
✅ **Activity Input** - Define activities with durations and dependencies
✅ **Automatic Calculations** - ES, EF, LS, LF, slack, critical path
✅ **Network Visualization** - Interactive project network diagrams
✅ **Timeline/Gantt Chart** - Visual project timeline
✅ **Critical Path Analysis** - Identify longest paths and bottlenecks
✅ **Probability Analysis** - PERT-based completion probability
✅ **Slack Analysis** - Identify schedule flexibility
✅ **Scenario Simulation** - Test what-if scenarios
✅ **Import/Export** - CSV, Excel, JSON, PDF support

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Recharts** - Visualizations
- **React Router** - Navigation

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **SQLite/PostgreSQL** - Database
- **NumPy/SciPy** - Scientific computations

## Project Structure

```
ProjectPath/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Utilities
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.9+ (for backend)
- npm or yarn (for frontend package management)

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Activities
- `GET /api/projects/{id}/activities` - List activities
- `POST /api/projects/{id}/activities` - Add activity
- `PUT /api/projects/{id}/activities/{id}` - Update activity
- `DELETE /api/projects/{id}/activities/{id}` - Delete activity

### Analysis
- `GET /api/projects/{id}/analyze` - Perform analysis
- `POST /api/projects/{id}/probability` - Calculate completion probability

## PERT/CPM Formulas

### Expected Time (PERT)
```
t = (a + 4m + b) / 6
where a = optimistic, m = most likely, b = pessimistic
```

### Variance (PERT)
```
σ² = ((b - a) / 6)²
```

### Probability of Completion
```
Z = (Deadline - Expected Project Time) / √(Project Variance)
P = Φ(Z)  [Standard Normal Distribution]
```

## Database Schema

### Projects Table
- id (UUID)
- name (string)
- method (CPM/PERT)
- timeUnit (days/weeks/months)
- createdAt (timestamp)
- updatedAt (timestamp)

### Activities Table
- id (UUID)
- projectId (FK)
- activityId (string)
- name (string)
- predecessors (string)
- duration (float)
- optimistic, mostLikely, pessimistic (float)
- cost, crashTime, crashCost (float)
- ES, EF, LS, LF, slack (float)
- isCritical (boolean)

## Core Algorithms

### Forward Pass
Calculates earliest start (ES) and earliest finish (EF) for all activities using topological sort.

### Backward Pass
Calculates latest start (LS) and latest finish (LF) for all activities.

### Slack Calculation
```
Slack = LS - ES = LF - EF
```

### Critical Path Detection
Activities with zero slack form the critical path.

## Validation Rules

The system validates:
- ✓ No cyclic dependencies (DAG validation)
- ✓ All predecessors exist
- ✓ No negative durations
- ✓ Unique activity IDs per project

## Performance

- Supports 1,000+ activities
- Analysis computation < 1s
- Network visualization < 2s render

## Future Enhancements

- 🔄 Resource leveling
- 📊 Multi-project portfolio analysis
- 🤖 AI schedule suggestions
- 🎲 Monte Carlo simulation
- 👥 Real-time collaboration
- 📚 Classroom mode for instructors

## Development

### Running Tests
```bash
cd backend
pytest
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend: Deploy with Gunicorn/Uvicorn

## License

MIT License - feel free to use this project freely

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**ProjectPath** - Simplifying project management through intelligent scheduling analysis.
