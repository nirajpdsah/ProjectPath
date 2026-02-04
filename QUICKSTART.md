# ProjectPath - Quick Start Guide

## Installation

### Quick Setup (Windows PowerShell)

```powershell
# Backend Setup
cd backend
pip install -r requirements.txt

# Frontend Setup
cd ../frontend
npm install
```

### Or with Docker

```bash
docker-compose up
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```
Backend will run on `http://localhost:8000`
API docs at `http://localhost:8000/docs`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## Using ProjectPath

### Step 1: Create a Project
1. Open the Dashboard at `http://localhost:3000`
2. Click "Create New Project"
3. Enter project name
4. Choose method: CPM (deterministic) or PERT (probabilistic)
5. Select time unit (days/weeks/months)

### Step 2: Add Activities
1. Click on the project to open it
2. In the "Add Activity" form on the right:
   - Enter Activity ID (e.g., A1)
   - Enter Activity Name
   - Enter Predecessors (comma-separated, if any)
   
   **For CPM projects:**
   - Enter Duration
   
   **For PERT projects:**
   - Enter Optimistic (a): best-case duration
   - Enter Most Likely (m): expected duration  
   - Enter Pessimistic (b): worst-case duration

3. Click "Add Activity"

### Step 3: Define Dependencies
- Enter predecessor activity IDs in the format: A1,A2,A3
- System will automatically detect cycles

### Step 4: Analyze Project
1. Click "📊 Analyze Project" button
2. View the analysis results:
   - **Project Duration**: Total time to complete
   - **Critical Path**: Sequence of activities that determines project duration
   - **Activity Schedule**: ES, EF, LS, LF, and Slack for each activity
   - **Critical Activities**: Activities with zero slack

### Step 5: Probability Analysis (PERT only)
1. In the "Completion Probability" section:
2. Enter a deadline
3. Click "Calculate Probability"
4. Get the probability of completing by that deadline

## Example Project

Create a simple project with these activities:

| ID | Name | Predecessors | Duration |
|---|---|---|---|
| A | Planning | - | 5 |
| B | Design | A | 7 |
| C | Implementation | B | 10 |
| D | Testing | C | 4 |
| E | Deployment | D | 2 |

Expected Results:
- Project Duration: 28 days
- Critical Path: A → B → C → D → E
- All activities are critical (no slack)

## API Documentation

### Available Endpoints

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### Activities
- `GET /api/projects/{id}/activities` - List activities
- `POST /api/projects/{id}/activities` - Add activity
- `PUT /api/projects/{id}/activities/{id}` - Update activity
- `DELETE /api/projects/{id}/activities/{id}` - Delete activity

#### Analysis
- `GET /api/projects/{id}/analyze` - Run analysis
- `POST /api/projects/{id}/probability` - Calculate probability

Access Swagger docs at: `http://localhost:8000/docs`

## Database

By default, the app uses SQLite (development). To use PostgreSQL:

```bash
# Set environment variable
export DATABASE_URL=postgresql://user:password@localhost:5432/projectpath

# Or on Windows PowerShell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/projectpath"

# Then run the backend
python main.py
```

## Troubleshooting

### Port already in use
```bash
# Change ports in App.tsx (frontend) and main.py (backend)
```

### CORS errors
- Check that the API proxy in vite.config.ts is correct
- Ensure backend is running on port 8000

### Activities not showing
- Make sure project was created successfully
- Check browser console for errors
- Check backend logs

### Analysis fails with "Graph contains cycles"
- Check predecessors for circular dependencies
- A → B → C → A would cause this error

## Tech Support

For issues:
1. Check the browser console (F12)
2. Check the backend terminal for error logs
3. Verify all activities have valid predecessors
4. Try refreshing the page

## Performance Tips

- For large projects (500+ activities), analysis may take a few seconds
- Use SQLite for small projects, PostgreSQL for production
- Optimize database queries for complex dependencies

---

**Happy Project Planning! 🚀**
