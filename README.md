# PEL ERP Backend

## Description

Backend API for the Petroleum Exploration Limited (PEL) ERP system, built with NestJS and Prisma ORM.

## Tech Stack

- **Framework**: NestJS (Fastify)
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (NeonDB)
- **Documentation**: Swagger API
- **Auth**: JWT with Passport.js

## Project Setup

```bash
$ npm install
```

## Database Migration

Generating Prisma client:

```bash
$ npx prisma generate
```

Pushing schema changes (for development):

```bash
$ npx prisma db push
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

Once the server is running, you can access the Swagger UI at:
`http://localhost:4000/api/docs`

## License

PEL Internal Use Only.
