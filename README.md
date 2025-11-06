# Campus Food Recovery Platform

A full-stack web application that connects catered campus events with leftover food to shelters and non-profit organizations through a network of student volunteers.

## Features

- **Multi-Role System**: Admin, Reporter, Driver, and Partner roles
- **Event Management**: CSV upload for bulk event import, manual event creation
- **Reporter Assignment**: Reporters can claim events and submit recovery reports with photos
- **Delivery Tracking**: Drivers receive notifications and can accept/track deliveries
- **Partner Management**: Automated partner assignment algorithm based on need and capacity
- **In-App Notifications**: Real-time updates for all users
- **Dashboard Analytics**: Role-specific dashboards with statistics and insights

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Multer for file uploads

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Leaflet/OpenStreetMap for mapping
- Responsive mobile-first design

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FoodRecoveryProgram
```

### 2. Run Setup Script

**Linux/Mac:**
```bash
./setup.sh
```

**Windows:**
```batch
setup.bat
```

The setup script will:
- Check for required dependencies
- Install all npm packages for backend and frontend
- Create `.env` configuration files
- Guide you through database setup
- Optionally seed the database with test data

### 3. Configure Database

During setup, you'll need to:

1. Start PostgreSQL service
2. Create a database:
   ```sql
   psql -U postgres
   CREATE DATABASE food_recovery;
   \q
   ```
3. Edit `backend/.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=food_recovery
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### 4. Start the Application

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

This will start both the backend and frontend servers.

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Test Accounts

If you seeded the database, use these accounts to test different roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@campus.edu | password123 | Full system access, can upload CSVs |
| Reporter | reporter1@campus.edu | password123 | Can accept events and submit reports |
| Driver | driver1@campus.edu | password123 | Can accept and complete deliveries |
| Partner | partner@shelter.org | password123 | Can view incoming deliveries |

## Project Structure

```
FoodRecoveryProgram/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration and schema
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, upload, etc.
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Main server file
│   ├── uploads/            # Local file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   └── package.json
├── setup.sh              # Linux/Mac setup script
├── setup.bat             # Windows setup script
├── start.sh              # Linux/Mac start script
├── start.bat             # Windows start script
└── README.md
```

## CSV Upload Format

For bulk event import, use a CSV with these columns:

```csv
title,location,start_time,end_time,expected_attendees,food_type,catering_company
Alumni Luncheon,Student Center,2024-12-15 12:00:00,2024-12-15 14:00:00,150,Buffet,Campus Catering
```

**Required**: title, location, start_time, end_time

## User Workflows

### Admin Workflow
1. Login → Upload events CSV → Monitor coverage → View analytics

### Reporter Workflow
1. Login → Accept event → Attend → Submit report with photos

### Driver Workflow
1. Login → Accept delivery → Pickup (photo) → Deliver (photo)

### Partner Workflow
1. Login → View incoming deliveries → Update need level

## Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start

# Database
cd backend && npm run migrate
cd backend && npm run seed
```

## Troubleshooting

**Database Issues**: Check PostgreSQL is running and credentials in `backend/.env`

**Port Conflicts**: Change ports in `.env` files

**Dependencies**: Run `npm install` in both backend and frontend

## Future Enhancements

- Real-time push notifications
- Google Maps integration
- SMS notifications
- Mobile apps
- Advanced analytics

## License

MIT License

---

Built for campus sustainability 🌱