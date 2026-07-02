# Admin Dashboard API

A robust, scalable, and secure backend API for an Admin Dashboard built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. The project strictly follows **Clean Architecture** principles to ensure maintainability, testability, and separation of concerns.

## 🚀 Features

- **Clean Architecture:** Divided into Domain, Application, Infrastructure, and Presentation layers.
- **Authentication & Authorization:** Secure JWT-based authentication with Access and Refresh tokens, and Role-Based Access Control (RBAC).
- **Security:** Integrated with `Helmet`, `CORS`, and Rate Limiting (`@nestjs/throttler`) to prevent common vulnerabilities and Brute Force attacks.
- **Centralized Error & Response Handling:** Global interceptors for standardized responses and exception filters for consistent error outputs.
- **Activity Logging:** Event-driven action logging system using `@nestjs/event-emitter` to track administrative activities automatically.
- **File Uploads:** Secure file uploading system (Multer) with strict size and type validation (`ParseFilePipe`).
- **Pagination & Filtering:** Standardized pagination and filtering capabilities for resource collections.
- **Soft Deletion:** Safe data removal by marking records as deleted without physically removing them from the database.
- **API Documentation:** Auto-generated interactive API documentation using Swagger (`@nestjs/swagger`).

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** Passport.js & JWT
- **Validation:** class-validator & class-transformer
- **Logging:** Winston Logger

## 📦 Project Structure

```text
src/
├── config/         # Application configurations (DB, JWT, etc.)
├── database/       # Prisma service and database connection
├── shared/         # Global interceptors, filters, decorators, and guards
├── auth/           # Authentication module (Login, Tokens, Password)
├── users/          # User management module (Admin CRUD operations)
├── upload/         # File upload module
└── logs/           # Event-driven activity logging module
```

## ⚙️ Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Running instance)

## 🚀 Getting Started

### 1. Clone the repository and install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root directory based on the configuration required:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/admin_dashboard?schema=public"

# Application Settings
NODE_ENV=development
PORT=3000

# JWT Secrets
JWT_ACCESS_SECRET="your_access_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"
```

### 3. Database Migration

Apply the Prisma schema to your database to generate the tables:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Running the Application

```bash
# development
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

## 📚 API Documentation (Swagger)

Once the application is running, you can access the interactive Swagger documentation at:

```
http://localhost:3000/api-docs
```
*(Assuming the app is running on port 3000 and the global prefix is `/api`)*

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📝 License

This project is [UNLICENSED](LICENSE).
