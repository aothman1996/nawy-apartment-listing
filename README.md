# Nawy Apartment Listing App

A full-stack apartment listing application with search, filtering, and responsive design capabilities.

## Features

### Core Functionality
- Apartment listing with search and filtering
- Detailed apartment views with image galleries
- Advanced search by unit name, project, and location
- Price, bedrooms, bathrooms, and amenity filters
- Responsive mobile-first design
- Data caching for performance

### Technical Stack
- TypeScript for type safety
- Next.js 15 with App Router
- Node.js 18 backend
- PostgreSQL database
- Docker containerization

## Technology

### Backend
- Node.js 18 with TypeScript
- Express.js
- PostgreSQL with Prisma ORM
- In-memory caching
- Express-validator
- Swagger/OpenAPI documentation

### Frontend
- Next.js 15 with App Router
- Tailwind CSS
- React Query for server state management
- Lucide React icons

### Infrastructure
- Docker and Docker Compose
- PostgreSQL with indexed queries
- Health checks and logging

## Setup

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

```bash
git clone <repository-url>
cd nawy
docker-compose up --build -d
```

The above command will:
- Build all Docker images
- Start PostgreSQL, backend, and frontend services
- Initialize the database schema
- Seed sample data
- Run health checks

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5005/api/v1
- API Documentation: http://localhost:5005/api-docs
- Health Check: http://localhost:5005/health

## Project Structure

```
nawy/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── database/
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apartments/search` | Search and filter apartments |
| GET | `/api/v1/apartments/:id` | Get apartment details |
| POST | `/api/v1/apartments` | Create apartment |
| PUT | `/api/v1/apartments/:id` | Update apartment |
| DELETE | `/api/v1/apartments/:id` | Delete apartment |
| GET | `/api/v1/apartments/locations` | Get all locations |

### Search and Filtering

```bash
GET /api/apartments?search=dubai&minPrice=100000&maxPrice=500000
GET /api/apartments?bedrooms=2&bathrooms=2&location=marina
GET /api/apartments?page=1&limit=20&sortBy=price&sortOrder=asc
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Database Schema

```sql
CREATE TABLE apartments (
  id VARCHAR PRIMARY KEY,
  unit_name VARCHAR NOT NULL,
  unit_number VARCHAR NOT NULL,
  project VARCHAR NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area_sqft INTEGER NOT NULL,
  location VARCHAR NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_apartments_search ON apartments(unit_name, unit_number, project);
CREATE INDEX idx_apartments_price ON apartments(price);
CREATE INDEX idx_apartments_location ON apartments(location);
CREATE INDEX idx_apartments_bedrooms ON apartments(bedrooms);
CREATE INDEX idx_apartments_bathrooms ON apartments(bathrooms);
CREATE INDEX idx_apartments_available ON apartments(is_available);
CREATE INDEX idx_apartments_created ON apartments(created_at);
```

### Caching Strategy
- Apartment details: 1 hour
- Search results: 2 minutes
- Locations: 30 minutes
- List results: 5 minutes

## Testing

### Backend
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Frontend
```bash
cd frontend
npm test
npm run test:watch
npm run type-check
```

## Environment Configuration

### Backend (.env)
```bash
DATABASE_URL="postgresql://nawy_user:nawy_password@postgres:5432/nawy_db"
PORT=5005
NODE_ENV=production
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

## Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks
```bash
curl http://localhost:5005/health
docker-compose exec postgres pg_isready -U nawy_user -d nawy_db
```

### Logging
- Structured JSON logs
- Request tracking with unique IDs
- Performance metrics

## Troubleshooting

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access containers
docker-compose exec backend sh
docker-compose exec postgres psql -U nawy_user -d nawy_db
```