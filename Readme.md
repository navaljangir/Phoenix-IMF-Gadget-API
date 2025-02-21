# Backend API - Redis, Express.js, Prisma ORM

## Overview

This is a backend API built using **Express.js**, **Prisma ORM**, and **Redis**. The API is designed to manage gadgets efficiently while ensuring optimal performance using Redis for caching.

## Features

- **Express.js** for API handling
- **Prisma ORM** for database management
- **Redis** for caching
- **Postman documentation** for easy API testing

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v16 or later)
- **PostgreSQL** (or any compatible database)

## Running the Project

### 1. Clone the Repository

```sh
git clone <repository_url>
cd backend-project
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory and configure it with the required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
REDIS_URL=redis://redis:6379
PORT=3000
```

### 3. Run the Project

If you have Redis and PostgreSQL installed locally, you can start the project with:

```sh
npm install
cd src/db && npx prisma migrate dev && cd ../..
npm run dev
```

Ensure Redis and PostgreSQL services are running on your machine.

## API Documentation

The API endpoints are documented in Postman:
[Postman Docs](https://www.postman.com/nvlkishor/my-workspace/request/iokujva/gadgets?action=share\&creator=31848720\&ctx=documentation)

## Live Deployment

The backend is deployed and available at:
[Live API](https://phoenix-imf-gadget-api-production.up.railway.app/)

