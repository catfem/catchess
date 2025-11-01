export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'CatChess API Worker' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (path === '/api/rooms/create') {
      const roomId = crypto.randomUUID().substring(0, 8);
      const now = Date.now();
      
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT INTO chess_rooms (id, players, game_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(roomId, JSON.stringify([]), null, now, now).run();
        } catch (error) {
          console.error('D1 insert error:', error);
        }
      }

      return new Response(
        JSON.stringify({ roomId, success: true }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (path.startsWith('/api/rooms/') && path.endsWith('/join')) {
      const roomId = path.split('/')[3];
      
      if (env.DB) {
        try {
          const result = await env.DB.prepare(
            'SELECT * FROM chess_rooms WHERE id = ?'
          ).bind(roomId).first();
          
          if (!result) {
            return new Response(
              JSON.stringify({ error: 'Room not found' }),
              { 
                status: 404, 
                headers: { 
                  ...corsHeaders, 
                  'Content-Type': 'application/json' 
                } 
              }
            );
          }

          const players = JSON.parse(result.players);
          
          if (players.length >= 2) {
            return new Response(
              JSON.stringify({ error: 'Room is full' }),
              { 
                status: 400, 
                headers: { 
                  ...corsHeaders, 
                  'Content-Type': 'application/json' 
                } 
              }
            );
          }

          const body = await request.json();
          const playerColor = players.length === 0 ? 'white' : 'black';
          players.push({ id: body.playerId, color: playerColor });

          await env.DB.prepare(
            'UPDATE chess_rooms SET players = ?, updated_at = ? WHERE id = ?'
          ).bind(JSON.stringify(players), Date.now(), roomId).run();

          return new Response(
            JSON.stringify({ 
              success: true, 
              color: playerColor,
              opponentConnected: players.length === 2 
            }),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        } catch (error) {
          console.error('D1 error:', error);
          return new Response(
            JSON.stringify({ error: 'Database error' }),
            { 
              status: 500, 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
