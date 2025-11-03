/**
 * Enhanced Cloudflare Worker for CatChess Platform
 * Production-grade API with authentication, rating, and full feature support
 */

import { ChessRoom } from './durable-objects/ChessRoom.js';

export { ChessRoom };

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// JWT secret - should be set in environment variables
const JWT_SECRET = 'your-secret-key-change-this';

// ====== UTILITY FUNCTIONS ======

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Simple JWT verification (for production, use a proper JWT library)
async function verifyJWT(token) {
  try {
    // This is a placeholder - implement proper JWT verification
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      return null;
    }
    
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Date.now() / 1000) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Rate limiting helper
const rateLimitMap = new Map();

function isRateLimited(ip, limit = 100, window = 60000) {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / window)}`;
  
  const count = rateLimitMap.get(key) || 0;
  if (count >= limit) {
    return true;
  }
  
  rateLimitMap.set(key, count + 1);
  
  // Cleanup old entries
  if (rateLimitMap.size > 10000) {
    const cutoff = now - window * 2;
    for (const [k, v] of rateLimitMap.entries()) {
      const timestamp = parseInt(k.split(':')[1]) * window;
      if (timestamp < cutoff) {
        rateLimitMap.delete(k);
      }
    }
  }
  
  return false;
}

// ====== MAIN WORKER ======

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Rate limiting
    if (isRateLimited(clientIP)) {
      return errorResponse('Too many requests', 429);
    }

    // ====== WEBSOCKET / DURABLE OBJECTS ======
    
    if (path.startsWith('/ws/room/')) {
      const roomId = path.split('/')[3];
      if (!roomId) {
        return errorResponse('Room ID required', 400);
      }
      
      const id = env.CHESS_ROOM.idFromName(roomId);
      const roomObject = env.CHESS_ROOM.get(id);
      return roomObject.fetch(request);
    }

    // ====== HEALTH CHECK ======
    
    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        message: 'CatChess API v2.0',
        timestamp: Date.now(),
        features: [
          'authentication',
          'ratings',
          'multiplayer',
          'tournaments',
          'puzzles',
          'leaderboards'
        ]
      });
    }

    // ====== AUTHENTICATION ======
    
    if (path === '/api/auth/register') {
      if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
      }
      
      const body = await request.json();
      const { username, email, password } = body;
      
      if (!username || !email || !password) {
        return errorResponse('Missing required fields');
      }
      
      // Check if user exists
      if (env.DB) {
        const existing = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ? OR email = ?'
        ).bind(username, email).first();
        
        if (existing) {
          return errorResponse('User already exists', 409);
        }
        
        // Create user
        const userId = crypto.randomUUID();
        const now = Date.now();
        
        await env.DB.prepare(`
          INSERT INTO users (id, username, email, password_hash, created_at, last_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, username, email, password, now, now).run();
        
        return jsonResponse({ userId, username, email });
      }
      
      return errorResponse('Database not available', 500);
    }

    if (path === '/api/auth/login') {
      if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
      }
      
      const body = await request.json();
      const { username, password } = body;
      
      if (!username || !password) {
        return errorResponse('Missing credentials');
      }
      
      if (env.DB) {
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ? AND password_hash = ?'
        ).bind(username, password).first();
        
        if (!user) {
          return errorResponse('Invalid credentials', 401);
        }
        
        // Create session token
        const token = btoa(JSON.stringify({
          userId: user.id,
          username: user.username,
          exp: Date.now() / 1000 + 86400 * 7 // 7 days
        }));
        
        return jsonResponse({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            rating_blitz: user.rating_blitz,
            rating_rapid: user.rating_rapid,
            rating_classical: user.rating_classical,
          }
        });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== ROOMS API ======
    
    if (path === '/api/rooms/create') {
      const roomId = crypto.randomUUID().substring(0, 8);
      const now = Date.now();
      
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT INTO chess_rooms (id, players, game_state, created_at, updated_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(roomId, JSON.stringify([]), null, now, now, now + 3600000).run();
        } catch (error) {
          console.error('D1 insert error:', error);
        }
      }

      return jsonResponse({ roomId, success: true });
    }

    if (path.startsWith('/api/rooms/') && path.endsWith('/join')) {
      const roomId = path.split('/')[3];
      
      if (env.DB) {
        try {
          const result = await env.DB.prepare(
            'SELECT * FROM chess_rooms WHERE id = ?'
          ).bind(roomId).first();
          
          if (!result) {
            return errorResponse('Room not found', 404);
          }

          const players = JSON.parse(result.players);
          
          if (players.length >= 2) {
            return errorResponse('Room is full', 400);
          }

          const body = await request.json();
          const playerColor = players.length === 0 ? 'white' : 'black';
          players.push({ id: body.playerId, color: playerColor });

          await env.DB.prepare(
            'UPDATE chess_rooms SET players = ?, updated_at = ? WHERE id = ?'
          ).bind(JSON.stringify(players), Date.now(), roomId).run();

          return jsonResponse({ 
            success: true, 
            color: playerColor,
            opponentConnected: players.length === 2 
          });
        } catch (error) {
          console.error('D1 error:', error);
          return errorResponse('Database error', 500);
        }
      }
    }

    // ====== LEADERBOARD ======
    
    if (path === '/api/leaderboard') {
      const timeControl = url.searchParams.get('timeControl') || 'blitz';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      if (env.DB) {
        const field = `rating_${timeControl}`;
        const users = await env.DB.prepare(`
          SELECT username, ${field} as rating
          FROM users
          WHERE is_banned = FALSE
          ORDER BY ${field} DESC
          LIMIT ?
        `).bind(limit).all();
        
        return jsonResponse({
          timeControl,
          leaderboard: users.results
        });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== USER STATS ======
    
    if (path.startsWith('/api/users/') && path.endsWith('/stats')) {
      const username = path.split('/')[3];
      
      if (env.DB) {
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ?'
        ).bind(username).first();
        
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        const stats = await env.DB.prepare(
          'SELECT * FROM user_stats WHERE user_id = ?'
        ).bind(user.id).first();
        
        return jsonResponse({
          username: user.username,
          ratings: {
            blitz: user.rating_blitz,
            rapid: user.rating_rapid,
            classical: user.rating_classical,
          },
          stats: stats || {
            total_games: 0,
            blitz_wins: 0,
            blitz_draws: 0,
            blitz_losses: 0,
            rapid_wins: 0,
            rapid_draws: 0,
            rapid_losses: 0,
            classical_wins: 0,
            classical_draws: 0,
            classical_losses: 0,
          }
        });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== GAME HISTORY ======
    
    if (path.startsWith('/api/users/') && path.endsWith('/games')) {
      const username = path.split('/')[3];
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      if (env.DB) {
        const user = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();
        
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        const games = await env.DB.prepare(`
          SELECT 
            g.id, g.result, g.time_control, g.opening_name,
            g.created_at, g.completed_at,
            w.username as white_username,
            b.username as black_username
          FROM games g
          JOIN users w ON g.white_id = w.id
          JOIN users b ON g.black_id = b.id
          WHERE g.white_id = ? OR g.black_id = ?
          ORDER BY g.completed_at DESC
          LIMIT ?
        `).bind(user.id, user.id, limit).all();
        
        return jsonResponse({ games: games.results });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== PUZZLES ======
    
    if (path === '/api/puzzles/random') {
      const rating = parseInt(url.searchParams.get('rating') || '1500');
      const ratingRange = 200;
      
      if (env.DB) {
        const puzzles = await env.DB.prepare(`
          SELECT * FROM puzzles
          WHERE rating BETWEEN ? AND ?
          ORDER BY RANDOM()
          LIMIT 1
        `).bind(rating - ratingRange, rating + ratingRange).all();
        
        if (puzzles.results.length === 0) {
          return errorResponse('No puzzles found', 404);
        }
        
        return jsonResponse({ puzzle: puzzles.results[0] });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== TOURNAMENTS ======
    
    if (path === '/api/tournaments') {
      if (env.DB) {
        const tournaments = await env.DB.prepare(`
          SELECT * FROM tournaments
          WHERE status IN ('pending', 'active')
          ORDER BY starts_at ASC
          LIMIT 20
        `).all();
        
        return jsonResponse({ tournaments: tournaments.results });
      }
      
      return errorResponse('Database not available', 500);
    }

    // ====== 404 ======
    
    return errorResponse('Not Found', 404);
  },
};
