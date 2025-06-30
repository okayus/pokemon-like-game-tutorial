import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types/env';
import { プレイヤー情報取得, プレイヤー情報保存, プレイヤー情報更新 } from './db/playerRepository';

// Hono with Cloudflare Workers（初学者向け：環境変数とデータベースを使えるように設定）
const app = new Hono<{ Bindings: Env }>();

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

// プレイヤー情報取得（初学者向け：データベースから実際のプレイヤー情報を取得）
app.get('/api/player/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  try {
    const プレイヤー = await プレイヤー情報取得(c.env.DB, playerId);
    
    if (!プレイヤー) {
      return c.json({ error: 'プレイヤーが見つかりません' }, 404);
    }
    
    return c.json(プレイヤー);
  } catch (error) {
    console.error('プレイヤー取得エラー:', error);
    return c.json({ error: 'サーバーエラーが発生しました' }, 500);
  }
});

// プレイヤー情報作成（初学者向け：新しいプレイヤーをデータベースに保存）
app.post('/api/player', async (c) => {
  try {
    const body = await c.req.json();
    
    // 新規プレイヤーのデータを作成
    const 新規プレイヤー = {
      id: crypto.randomUUID(), // ランダムなIDを生成
      name: body.name || 'プレイヤー',
      position: { x: 7, y: 5 }, // 初期位置
      direction: 'down' as const,
      sprite: 'player'
    };
    
    await プレイヤー情報保存(c.env.DB, 新規プレイヤー);
    
    return c.json(新規プレイヤー, 201);
  } catch (error) {
    console.error('プレイヤー作成エラー:', error);
    return c.json({ error: 'サーバーエラーが発生しました' }, 500);
  }
});

// プレイヤー位置更新（初学者向け：プレイヤーの移動情報をデータベースに保存）
app.put('/api/player/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  try {
    const body = await c.req.json();
    
    await プレイヤー情報更新(c.env.DB, playerId, {
      position: body.position,
      direction: body.direction
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('プレイヤー更新エラー:', error);
    return c.json({ error: 'サーバーエラーが発生しました' }, 500);
  }
});

export default app;