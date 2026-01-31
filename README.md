# SwiftCart (Next.js E-commerce)

SwiftCart is a full-stack e-commerce demo built with Next.js (Pages Router), Prisma, and NextAuth. It supports SSR for product listings and detail pages, a protected cart with API routes, and Dockerized local setup.

## Requirements

- Node.js 20+
- Docker + Docker Compose
- GitHub OAuth app (Client ID + Secret)

## Quick Start (Docker)

1. Copy environment template:

	 ```bash
	 cp .env.example .env
	 ```

2. Add your GitHub OAuth credentials to .env.

3. Start the stack:

	 ```bash
	 docker-compose up --build
	 ```

4. Visit http://localhost:3000.

The database is seeded automatically when the DB container starts.

## Local Development (without Docker)

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Scripts

- npm run dev — start dev server
- npm run build — production build
- npm run start — run production server

## Environment Variables

See .env.example for the complete list. Required:

- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GITHUB_ID
- GITHUB_SECRET

## Test User

The database seed includes a test user defined in submission.json:

```json
{
	"testUser": {
		"email": "test.user@example.com",
		"name": "Test User"
	}
}
```
