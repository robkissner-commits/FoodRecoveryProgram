#!/bin/bash

echo "======================================================"
echo "  Campus Food Recovery Platform - Setup Script"
echo "======================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js (v16 or higher) from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

echo ""
echo "======================================================"
echo "  Step 1: Setting up Backend"
echo "======================================================"

cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env and configure your database credentials${NC}"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..

echo ""
echo "======================================================"
echo "  Step 2: Setting up Frontend"
echo "======================================================"

cd frontend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "======================================================"
echo "  Step 3: Database Setup"
echo "======================================================"

echo ""
echo -e "${YELLOW}Database Configuration Required:${NC}"
echo "1. Make sure PostgreSQL is running"
echo "2. Create a database named 'food_recovery' (or your preferred name)"
echo "3. Update backend/.env with your database credentials"
echo ""
echo "Example PostgreSQL commands:"
echo "  $ psql -U postgres"
echo "  postgres=# CREATE DATABASE food_recovery;"
echo "  postgres=# \\q"
echo ""

read -p "Have you created the database and configured backend/.env? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Running database migrations..."
    cd backend
    npm run build
    npm run migrate

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database migrations completed${NC}"

        echo ""
        read -p "Would you like to seed the database with test data? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm run seed
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Database seeded with test data${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Database migration failed${NC}"
        echo "Please check your database configuration in backend/.env"
        exit 1
    fi

    cd ..
fi

echo ""
echo "======================================================"
echo "  Setup Complete!"
echo "======================================================"
echo ""
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo ""
echo "To start the application:"
echo "  $ ./start.sh"
echo ""
echo "Or manually:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm start"
echo ""
echo "Default URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Test Accounts (if database was seeded):"
echo "  Admin:    admin@campus.edu / password123"
echo "  Reporter: reporter1@campus.edu / password123"
echo "  Driver:   driver1@campus.edu / password123"
echo "  Partner:  partner@shelter.org / password123"
echo ""
echo "======================================================"
