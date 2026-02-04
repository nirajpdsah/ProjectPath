#!/bin/bash

# ProjectPath Setup Script

echo "🚀 Starting ProjectPath Setup..."

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

# Create virtual environment
$PYTHON_CMD -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

if command -v npm &> /dev/null; then
    npm install
    echo "✅ Frontend setup complete"
else
    echo "⚠️  npm not found. Please install Node.js and run 'npm install' in the frontend directory"
fi

echo ""
echo "✨ Setup complete! You can now run:"
echo ""
echo "Backend: cd backend && python main.py"
echo "Frontend: cd frontend && npm run dev"
echo ""
