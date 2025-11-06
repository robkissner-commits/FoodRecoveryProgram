@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo   Campus Food Recovery Platform - Setup Script
echo ======================================================
echo.

echo Checking prerequisites...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is not installed
    echo Please install Node.js ^(v16 or higher^) from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm is not installed
    pause
    exit /b 1
)
echo [OK] npm found

:: Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL command-line tools not found in PATH
    echo Make sure PostgreSQL is installed and running
)

echo.
echo ======================================================
echo   Step 1: Setting up Backend
echo ======================================================

cd backend

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env and configure your database credentials
)

:: Install backend dependencies
echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

cd ..

echo.
echo ======================================================
echo   Step 2: Setting up Frontend
echo ======================================================

cd frontend

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
)

:: Install frontend dependencies
echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

echo.
echo ======================================================
echo   Step 3: Database Setup
echo ======================================================
echo.
echo Database Configuration Required:
echo 1. Make sure PostgreSQL is running
echo 2. Create a database named 'food_recovery' ^(or your preferred name^)
echo 3. Update backend\.env with your database credentials
echo.
echo Example PostgreSQL commands:
echo   psql -U postgres
echo   CREATE DATABASE food_recovery;
echo   \q
echo.

set /p DBREADY="Have you created the database and configured backend\.env? (y/n) "
if /i "%DBREADY%"=="y" (
    echo.
    echo Running database migrations...
    cd backend
    call npm run build
    call npm run migrate

    if !ERRORLEVEL! EQU 0 (
        echo [OK] Database migrations completed

        echo.
        set /p SEEDDB="Would you like to seed the database with test data? (y/n) "
        if /i "!SEEDDB!"=="y" (
            call npm run seed
            if !ERRORLEVEL! EQU 0 (
                echo [OK] Database seeded with test data
            )
        )
    ) else (
        echo [X] Database migration failed
        echo Please check your database configuration in backend\.env
        cd ..
        pause
        exit /b 1
    )

    cd ..
)

echo.
echo ======================================================
echo   Setup Complete!
echo ======================================================
echo.
echo [OK] Setup completed successfully!
echo.
echo To start the application:
echo   start.bat
echo.
echo Or manually:
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm start
echo.
echo Default URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Test Accounts ^(if database was seeded^):
echo   Admin:    admin@campus.edu / password123
echo   Reporter: reporter1@campus.edu / password123
echo   Driver:   driver1@campus.edu / password123
echo   Partner:  partner@shelter.org / password123
echo.
echo ======================================================
pause
