# Cloudflare Workers API

This directory contains the Cloudflare Workers API endpoints for CatChess.

## Structure

```
workers/api/
├── auth.ts          # Authentication endpoints
├── games.ts         # Game CRUD operations
├── users.ts         # User profile management
├── analysis.ts      # Server-side analysis
├── puzzles.ts       # Puzzle management
├── leaderboard.ts   # Ranking system
└── index.ts         # Main worker entry point
```

## Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/github` - GitHub OAuth

### Games (`/api/games`)
- `GET /api/games` - List games
- `POST /api/games` - Create game
- `GET /api/games/:id` - Get game details
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game
- `POST /api/games/:id/moves` - Add move to game

### Users (`/api/users`)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/games` - Get user games
- `GET /api/users/:id/stats` - Get user statistics

### Analysis (`/api/analysis`)
- `POST /api/analysis/position` - Analyze position
- `POST /api/analysis/game` - Analyze full game
- `GET /api/analysis/:id` - Get analysis results

### Puzzles (`/api/puzzles`)
- `GET /api/puzzles` - List puzzles
- `GET /api/puzzles/random` - Get random puzzle
- `GET /api/puzzles/:id` - Get puzzle details
- `POST /api/puzzles/:id/solve` - Submit puzzle solution

### Leaderboard (`/api/leaderboard`)
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/:timeControl` - Get leaderboard by time control

## Development

### Setup

```bash
cd workers
npm install
```

### Local Testing

```bash
wrangler dev
```

### Deployment

```bash
wrangler deploy
```

## Environment Variables

```bash
# wrangler.toml or .env
JWT_SECRET=your-secret-key
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

## D1 Database

The workers use Cloudflare D1 for data persistence.

### Setup

```bash
# Create D1 database
wrangler d1 create catchess-db

# Run migrations
wrangler d1 execute catchess-db --file=./schema.sql
```

## Rate Limiting

All API endpoints are rate-limited:
- 100 requests per minute per IP
- 1000 requests per hour per user

## CORS Configuration

CORS is configured to allow requests from:
- https://catchess.pages.dev
- https://your-custom-domain.com
- http://localhost:5173 (development)

## Authentication

JWT tokens are used for authentication:
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Stored in httpOnly cookies

## Error Handling

Standard error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
