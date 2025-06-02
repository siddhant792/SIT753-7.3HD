# Task Management Platform - Backend

A multi-tenant task management platform built with Node.js, Express, and PostgreSQL.

## Features

- Multi-tenant architecture
- User authentication and authorization
- Task management with comments and attachments
- Real-time updates using WebSocket
- Email notifications
- File uploads
- Role-based access control
- Subscription management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- SMTP server for email notifications

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8080

# Database Configuration
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@example.com

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=5242880 # 5MB in bytes
UPLOAD_DIR=uploads
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create the database:
```bash
createdb task_management
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/comments` - Add a comment to a task

### Tenants

- `POST /api/tenants` - Create a new tenant
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/:id` - Get a specific tenant
- `PUT /api/tenants/:id` - Update a tenant
- `DELETE /api/tenants/:id` - Delete a tenant
- `PUT /api/tenants/:id/settings` - Update tenant settings
- `PUT /api/tenants/:id/subscription` - Update tenant subscription

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database Migrations

```bash
npm run migrate
```

## Production Deployment

1. Set environment variables for production
2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t task-management-backend .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env task-management-backend
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 