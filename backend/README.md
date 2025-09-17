# Parkiraj.me Backend API

FastAPI backend for the parking marketplace application.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Listings Management**: CRUD operations for parking space listings
- **Booking System**: Create and manage parking space bookings
- **Real-time Chat**: WebSocket-based messaging between hosts and guests
- **User Dashboard**: Endpoints for user profile, listings, and invoices
- **Search & Filtering**: Advanced search capabilities for listings

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLModel**: SQL databases in Python, designed for simplicity, compatibility, and robustness
- **PostgreSQL**: Robust relational database
- **Alembic**: Database migration tool
- **JWT**: JSON Web Tokens for authentication
- **WebSockets**: Real-time communication
- **Pydantic**: Data validation using Python type annotations

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb parkiraj_db
   ```

4. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start the development server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /api/v1/users/` - Register new user
- `POST /api/v1/token` - Login and get access token

### Users
- `GET /api/v1/users/me/` - Get current user profile
- `GET /api/v1/users/me/listings/` - Get user's listings
- `GET /api/v1/users/me/invoices/` - Get user's invoices

### Listings
- `POST /api/v1/listings/` - Create new listing (protected)
- `GET /api/v1/listings/` - Search listings (public)
- `GET /api/v1/listings/{id}` - Get listing details (public)
- `PUT /api/v1/listings/{id}` - Update listing (protected, owner only)
- `DELETE /api/v1/listings/{id}` - Delete listing (protected, owner only)

### Bookings
- `POST /api/v1/bookings/` - Create booking request (protected)
- `GET /api/v1/bookings/me/bookings` - Get user's bookings (protected)
- `GET /api/v1/bookings/me/rents` - Get bookings for user's listings (protected)
- `PATCH /api/v1/bookings/{id}` - Update booking status (protected, owner only)

### WebSocket
- `WS /api/v1/ws/chat/{booking_id}?token={jwt_token}` - Real-time chat

## Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **listings**: Parking space listings
- **bookings**: Booking requests and confirmations
- **messages**: Chat messages between users
- **invoices**: Generated invoices for completed bookings

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Formatting
```bash
black .
isort .
```

## Production Deployment

1. Set up production environment variables
2. Use a production WSGI server like Gunicorn
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Set up database backups
6. Configure logging and monitoring

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`