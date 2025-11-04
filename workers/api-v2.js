import { ChessRoom } from './durable-objects/ChessRoom.js';

export { ChessRoom };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/auth/register') {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return errorResponse('Missing required fields');
    }

    const userId = crypto.randomUUID();
    const now = Date.now();

    try {
      const existing = await env.DB.prepare(
        'SELECT id FROM users WHERE username = ? OR email = ?'
      ).bind(username, email).first();

      if (existing) {
        return errorResponse('Username or email already exists');
      }

      await env.DB.prepare(
        `INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(userId, username, email, password, now, now).run();

      const token = crypto.randomUUID();

      return jsonResponse({
        success: true,
        data: {
          user: { id: userId, username, email },
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      return errorResponse('Registration failed', 500);
    }
  }

  if (path === '/api/auth/login') {
    const { username, password } = await request.json();

    try {
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE username = ? AND password_hash = ?'
      ).bind(username, password).first();

      if (!user) {
        return errorResponse('Invalid credentials', 401);
      }

      const token = crypto.randomUUID();

      return jsonResponse({
        success: true,
        data: {
          user: { id: user.id, username: user.username, email: user.email },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse('Login failed', 500);
    }
  }

  return errorResponse('Not found', 404);
}

async function handleGames(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/games/create') {
    const roomId = crypto.randomUUID().substring(0, 8);
    const now = Date.now();

    try {
      await env.DB.prepare(
        `INSERT INTO games (id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?)`
      ).bind(roomId, 'waiting', now, now).run();

      return jsonResponse({
        success: true,
        data: { roomId },
      });
    } catch (error) {
      console.error('Create game error:', error);
      return errorResponse('Failed to create game', 500);
    }
  }

  if (path.match(/\/api\/games\/[\w-]+\/join/)) {
    const roomId = path.split('/')[3];
    const { userId, username } = await request.json();

    try {
      const game = await env.DB.prepare(
        'SELECT * FROM games WHERE id = ?'
      ).bind(roomId).first();

      if (!game) {
        return errorResponse('Game not found', 404);
      }

      if (game.status !== 'waiting') {
        return errorResponse('Game already started');
      }

      const color = game.white_player_id ? 'black' : 'white';
      const column = color === 'white' ? 'white_player_id' : 'black_player_id';

      await env.DB.prepare(
        `UPDATE games SET ${column} = ?, status = ?, updated_at = ? WHERE id = ?`
      ).bind(userId, color === 'black' ? 'active' : 'waiting', Date.now(), roomId).run();

      return jsonResponse({
        success: true,
        data: { color, roomId },
      });
    } catch (error) {
      console.error('Join game error:', error);
      return errorResponse('Failed to join game', 500);
    }
  }

  if (path.match(/\/api\/games\/history\/[\w-]+/)) {
    const userId = path.split('/')[4];
    const limit = parseInt(url.searchParams.get('limit') || '20');

    try {
      const games = await env.DB.prepare(
        `SELECT * FROM games 
         WHERE white_player_id = ? OR black_player_id = ?
         ORDER BY created_at DESC
         LIMIT ?`
      ).bind(userId, userId, limit).all();

      return jsonResponse({
        success: true,
        data: games.results || [],
      });
    } catch (error) {
      console.error('Game history error:', error);
      return errorResponse('Failed to fetch game history', 500);
    }
  }

  return errorResponse('Not found', 404);
}

async function handleTournaments(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/tournaments') {
    try {
      const tournaments = await env.DB.prepare(
        `SELECT * FROM tournaments 
         WHERE status IN ('pending', 'active')
         ORDER BY start_time ASC
         LIMIT 50`
      ).all();

      return jsonResponse({
        success: true,
        data: tournaments.results || [],
      });
    } catch (error) {
      console.error('Tournaments error:', error);
      return errorResponse('Failed to fetch tournaments', 500);
    }
  }

  if (path.match(/\/api\/tournaments\/[\w-]+\/join/)) {
    const tournamentId = path.split('/')[3];
    const { userId, username } = await request.json();

    try {
      const tournament = await env.DB.prepare(
        'SELECT * FROM tournaments WHERE id = ?'
      ).bind(tournamentId).first();

      if (!tournament) {
        return errorResponse('Tournament not found', 404);
      }

      if (tournament.status !== 'pending') {
        return errorResponse('Tournament already started');
      }

      await env.DB.prepare(
        `INSERT INTO tournament_participants (tournament_id, user_id, username, score)
         VALUES (?, ?, ?, 0)`
      ).bind(tournamentId, userId, username).run();

      return jsonResponse({
        success: true,
        data: { tournamentId },
      });
    } catch (error) {
      console.error('Join tournament error:', error);
      return errorResponse('Failed to join tournament', 500);
    }
  }

  return errorResponse('Not found', 404);
}

async function handlePuzzles(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/puzzles') {
    const rating = parseInt(url.searchParams.get('rating') || '1500');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    try {
      const puzzles = await env.DB.prepare(
        `SELECT * FROM puzzles 
         WHERE rating BETWEEN ? AND ?
         ORDER BY RANDOM()
         LIMIT ?`
      ).bind(rating - 200, rating + 200, limit).all();

      return jsonResponse({
        success: true,
        data: puzzles.results || [],
      });
    } catch (error) {
      console.error('Puzzles error:', error);
      return errorResponse('Failed to fetch puzzles', 500);
    }
  }

  if (path.match(/\/api\/puzzles\/[\w-]+\/result/)) {
    const puzzleId = path.split('/')[3];
    const { userId, correct, time } = await request.json();

    try {
      await env.DB.prepare(
        `INSERT INTO puzzle_attempts (user_id, puzzle_id, correct, time_taken, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(userId, puzzleId, correct ? 1 : 0, time, Date.now()).run();

      return jsonResponse({
        success: true,
      });
    } catch (error) {
      console.error('Puzzle result error:', error);
      return errorResponse('Failed to save puzzle result', 500);
    }
  }

  return errorResponse('Not found', 404);
}

async function handleLeaderboard(request, env) {
  const url = new URL(request.url);
  const timeControl = url.searchParams.get('timeControl') || 'blitz';

  try {
    const leaderboard = await env.DB.prepare(
      `SELECT u.id, u.username, r.rating, r.games_played, r.wins, r.losses, r.draws
       FROM users u
       JOIN ratings r ON u.id = r.user_id
       WHERE r.time_control = ?
       ORDER BY r.rating DESC
       LIMIT 100`
    ).bind(timeControl).all();

    return jsonResponse({
      success: true,
      data: leaderboard.results || [],
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return errorResponse('Failed to fetch leaderboard', 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path.startsWith('/ws/')) {
      const roomId = path.split('/')[2];
      if (!roomId) {
        return errorResponse('Room ID required');
      }

      const id = env.CHESS_ROOM.idFromName(roomId);
      const roomObject = env.CHESS_ROOM.get(id);
      return roomObject.fetch(request);
    }

    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        message: 'CatChess API v2',
        version: '3.0.0',
      });
    }

    if (path.startsWith('/api/auth/')) {
      return handleAuth(request, env);
    }

    if (path.startsWith('/api/games/')) {
      return handleGames(request, env);
    }

    if (path.startsWith('/api/tournaments')) {
      return handleTournaments(request, env);
    }

    if (path.startsWith('/api/puzzles')) {
      return handlePuzzles(request, env);
    }

    if (path === '/api/leaderboard') {
      return handleLeaderboard(request, env);
    }

    return errorResponse('Not found', 404);
  },
};
