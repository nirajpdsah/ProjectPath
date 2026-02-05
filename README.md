# ProjectPath - PERT/CPM Project Management Tool

A modern, full-featured project management application for analyzing complex project schedules using PERT (Program Evaluation and Review Technique) and CPM (Critical Path Method) methodologies.

## Features

### Core Analysis
- **PERT Analysis** - Three-point estimation (optimistic, most likely, pessimistic)
- **CPM Analysis** - Single-point duration estimation
- **Network Diagrams** - Visual representation of project activities and dependencies
- **Critical Path Identification** - Automatic detection of critical activities
- **Probability Analysis** - Calculate project completion probabilities
- **Crashing Analysis** - Optimize project duration with cost considerations
- **Monitoring Dashboard** - Real-time project progress tracking

### Data Management
- **Project Creation** - Support for both PERT and CPM methodologies
- **Activity Management** - Add, edit, and delete activities with dependencies
- **Bulk Import** - Import activities from various formats
- **Data Export** - Export projects as PDF or JSON
- **Cloud Sync** - Cross-device synchronization (with authentication)

### Authentication & Access
- **Optional Login** - Use with or without authentication
- **Guest Mode** - Full feature access without account creation
- **Persistent Storage** - Data persists locally (guest) or in cloud (authenticated)
- **JWT-based Security** - Secure token-based authentication

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with bcrypt
- **Analysis Engine**: Custom PERT/CPM algorithms
- **Export**: PDF generation with ReportLab

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Network Visualization**: Cytoscape.js
- **UI Components**: Responsive, accessible design

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProjectPath
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   Server runs on `http://localhost:8001`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Application runs on `http://localhost:5173`

## Quick Start

### Using Guest Mode (No Account Required)
1. Open the application at `http://localhost:5173`
2. Click "Create Project"
3. Add activities with dependencies
4. Click "Analyze" to view network diagrams and results
5. Export results as PDF or JSON

### Using Authenticated Mode
1. Click "Sign Up" to create an account
2. Log in with your credentials
3. Create and manage projects
4. Your projects sync across devices

## Project Structure

```
ProjectPath/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── projects.py
│   │   │   ├── activities.py
│   │   │   ├── analysis.py
│   │   │   └── auth.py
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── auth.py           # Authentication utilities
│   │   └── database.py       # Database connection
│   ├── main.py               # Application entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── utils/            # Utility functions
│   │   └── store/            # State management
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml        # Docker configuration
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - User login

### Projects (Authenticated)
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Activities
- `POST /projects/{id}/activities` - Add activity
- `GET /projects/{id}/activities` - List activities
- `PUT /projects/{id}/activities/{activityId}` - Update activity
- `DELETE /projects/{id}/activities/{activityId}` - Delete activity

### Analysis
- `GET /projects/{id}/analyze` - Perform PERT/CPM analysis
- `GET /projects/{id}/crashing` - Crashing analysis
- `GET /projects/{id}/export?format=pdf|json` - Export project

### Guest Endpoints
- `POST /projects/analyze-adhoc` - Analysis without persistence
- `POST /projects/analyze-adhoc/crashing` - Guest crashing analysis
- `POST /projects/export-adhoc` - Guest export

## Usage Examples

### Create a PERT Project
```javascript
POST /projects
{
  "name": "Website Redesign",
  "method": "PERT",
  "timeUnit": "days"
}
```

### Add an Activity
```javascript
POST /projects/{projectId}/activities
{
  "activityId": "A",
  "name": "Requirements",
  "optimistic": 2,
  "mostLikely": 4,
  "pessimistic": 8,
  "predecessors": ""
}
```

### Run Analysis
```javascript
GET /projects/{projectId}/analyze
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./projectpath.db
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
```

## Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8001`

## Development

### Running Tests
```bash
cd backend
pytest
```

### Code Formatting
```bash
# Backend
black .
flake8 .

# Frontend
npm run lint
npm run format
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Performance Considerations

- Network diagrams optimize rendering for projects up to 1000 activities
- Analysis calculations use efficient algorithms suitable for real-time computation
- Export generation typically takes <5 seconds for standard projects

## Troubleshooting

### Backend Connection Errors
- Ensure backend is running: `python main.py` on port 8001
- Check CORS settings in `main.py`

### Database Issues
- Delete `projectpath.db` to reset database
- Ensure Python 3.8+ is installed

### Frontend Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .venv`

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
