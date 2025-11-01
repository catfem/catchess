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
      
      if (env.CHESS_ROOMS) {
        await env.CHESS_ROOMS.put(roomId, JSON.stringify({
          id: roomId,
          players: [],
          gameState: null,
          createdAt: Date.now(),
        }), { expirationTtl: 3600 });
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
      
      if (env.CHESS_ROOMS) {
        const roomData = await env.CHESS_ROOMS.get(roomId);
        
        if (!roomData) {
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

        const room = JSON.parse(roomData);
        
        if (room.players.length >= 2) {
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
        const playerColor = room.players.length === 0 ? 'white' : 'black';
        room.players.push({ id: body.playerId, color: playerColor });

        await env.CHESS_ROOMS.put(roomId, JSON.stringify(room), { expirationTtl: 3600 });

        return new Response(
          JSON.stringify({ 
            success: true, 
            color: playerColor,
            opponentConnected: room.players.length === 2 
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
