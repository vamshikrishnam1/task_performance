# Team Performance Dashboard

A comprehensive web application for tracking team performance metrics, calculating Task Completion Rate (TCR) and Task Precision Rate (TPR) for weekly reporting.

## Features

- **Weekly Report Creation**: Create detailed performance reports for team members
- **Automatic Calculations**: TCR and TPR calculated using precise mathematical formulas
- **Team Management**: Track performance for up to 8 team members
- **Performance Analytics**: Visual dashboard with performance indicators and trends
- **Data Export**: Export reports in CSV format
- **Report History**: View and manage historical performance data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling with Shadcn/UI components
- **TanStack Query** for efficient data fetching and caching
- **React Hook Form** with Zod validation for form management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js server
- **TypeScript** for consistent type checking
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **RESTful API** design with JSON responses

## Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud-hosted)
- **Git** for version control

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd team-performance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE team_performance;
```

#### Option B: Cloud PostgreSQL (Recommended)
- Use services like **Neon**, **Supabase**, or **Railway**
- Create a new PostgreSQL database
- Note the connection string

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/team_performance"

# Alternative format for cloud databases:
# DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Important**: Replace the DATABASE_URL with your actual PostgreSQL connection string.

### 5. Database Migration

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This command will:
- Create the `weekly_reports` table
- Set up the necessary indexes
- Prepare the database for data storage

### 6. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Usage Guide

### Creating a Weekly Report

1. **Navigate to Dashboard**: Open the application in your browser
2. **Click "Create New Report"**: Located in the top-right corner
3. **Fill Report Details**:
   - Select week start and end dates
   - Choose the week owner from the dropdown
4. **Add Team Member Data**:
   - Enter assigned and completed tasks for each team member
   - Add bug counts (Critical, High, Medium, Low priority)
5. **Calculate Metrics**: Click "Calculate TCR & TPR" to compute performance scores
6. **Save Report**: Click "Save Report" to store the data

### Performance Calculations

#### Task Completion Rate (TCR)
```
TCR = (Completed Tasks / Assigned Tasks) × 100
```

#### Task Precision Rate (TPR)
```
TPR = ((Max Possible Weighted Bug Score - Actual Weighted Bug Score) / Max Possible Weighted Bug Score) × 100

Where:
- Critical bugs = 5 points each
- High bugs = 4 points each
- Medium bugs = 3 points each
- Low bugs = 2 points each
```

### Team Members

The system supports tracking for these team members:
- Deepak
- Jitin  
- Minhaj
- Prateek
- Ashish
- Dheeraj
- Ravi Bhagat
- Sahitya

## Database Schema

### Weekly Reports Table
```sql
CREATE TABLE weekly_reports (
  id SERIAL PRIMARY KEY,
  week_owner VARCHAR(255) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  team_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Data Structure (JSON)
```json
{
  "deepak": {
    "assigned": 10,
    "completed": 8,
    "bugs": {
      "critical": 0,
      "high": 1,
      "medium": 2,
      "low": 1
    },
    "tcr": 80.0,
    "tpr": 85.5
  }
}
```

## Deployment

### Using Docker

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Build and run**:
```bash
docker build -t team-performance-dashboard .
docker run -p 5000:5000 --env-file .env team-performance-dashboard
```

### Using Heroku

1. **Create Heroku app**:
```bash
heroku create your-app-name
```

2. **Set environment variables**:
```bash
heroku config:set DATABASE_URL="your-postgresql-connection-string"
```

3. **Deploy**:
```bash
git push heroku main
```

### Using Railway

1. **Connect GitHub repository**
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically** on git push

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |

## API Endpoints

### GET /api/reports
- **Description**: Fetch all weekly reports
- **Response**: Array of report objects
- **Status**: 200 OK

### POST /api/reports
- **Description**: Create a new weekly report
- **Body**: Report data with team metrics
- **Response**: Created report object
- **Status**: 201 Created

### GET /api/reports/:id
- **Description**: Fetch specific report by ID
- **Parameters**: `id` (report ID)
- **Response**: Report object
- **Status**: 200 OK

### DELETE /api/reports/:id
- **Description**: Delete a report
- **Parameters**: `id` (report ID)
- **Response**: Success message
- **Status**: 200 OK

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correctly formatted
- Check PostgreSQL service is running
- Ensure database exists and is accessible
- Verify network connectivity for cloud databases

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

### Performance Issues
- Check database indexes are created
- Monitor PostgreSQL connection pool
- Optimize queries for large datasets
- Consider implementing data pagination

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   └── lib/           # Utilities and helpers
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── dist/                 # Production build output
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

## Changelog

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added PostgreSQL support and enhanced dashboard
- **v1.2.0** - Improved UI/UX and performance optimizations