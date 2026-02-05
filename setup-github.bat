@echo off
REM Quick GitHub setup script for Windows

echo ========================================
echo ProjectPath - GitHub Setup
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed. Please install Git from https://git-scm.com
    exit /b 1
)

echo Step 1: Initialize git repository
git init
echo ✓ Git initialized

echo.
echo Step 2: Add all files
git add .
echo ✓ Files staged

echo.
echo Step 3: Create initial commit
git commit -m "Initial commit - ProjectPath PERT/CPM Tool"
echo ✓ Initial commit created

echo.
echo Step 4: Rename branch to main
git branch -M main
echo ✓ Branch renamed to main

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Create a new repository on GitHub (https://github.com/new)
echo    - Name it "ProjectPath"
echo    - DO NOT initialize with README/LICENSE
echo    - Click "Create repository"
echo.
echo 2. Copy the repository URL (https://github.com/YOUR_USERNAME/ProjectPath.git)
echo.
echo 3. Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/ProjectPath.git
echo    git push -u origin main
echo.
echo 4. Then follow the deployment guide in DEPLOYMENT.md
echo.
pause
