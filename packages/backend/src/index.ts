import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
  return c.json({ message: 'Pokemon-like Game API' });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/maps/:mapId', (c) => {
  const mapId = c.req.param('mapId');
  
  // Simple mock map data
  if (mapId === 'town') {
    return c.json({
      id: 'town',
      name: 'Starting Town',
      width: 15,
      height: 11,
      tiles: Array(11).fill(null).map(() => 
        Array(15).fill({ type: 'grass', walkable: true })
      ),
      exits: [],
    });
  }
  
  return c.json({ error: 'Map not found' }, 404);
});

app.get('/api/player/:playerId', (c) => {
  const playerId = c.req.param('playerId');
  
  // Simple mock player data
  return c.json({
    id: playerId,
    name: 'Player',
    position: { x: 5, y: 5 },
    direction: 'down',
    sprite: 'player',
  });
});

export default app;