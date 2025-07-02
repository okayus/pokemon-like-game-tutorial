import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types/env';
// import { プレイヤー情報取得, プレイヤー情報保存, プレイヤー情報更新 } from './db/playerRepository';
// import { セーブデータ保存, セーブデータ取得, ユーザーの全セーブデータ取得, セーブデータ削除 } from './db/saveRepository';
import pokemonRoutes from './routes/pokemon';
import { アイテムルート } from './routes/items';
import { battleRoutes } from './routes/battle';

// Hono with Cloudflare Workers（初学者向け：環境変数とデータベースを使えるように設定）
const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// ポケモン関連のAPIルートをマウント（初学者向け：ポケモン機能を追加）
app.route('/api/pokemon', pokemonRoutes);

// アイテム関連のAPIルートをマウント（初学者向け：アイテム・インベントリ機能を追加）
app.route('/api/items', アイテムルート);

// バトル関連のAPIルートをマウント（初学者向け：バトルシステム機能を追加）
app.route('/api/battle', battleRoutes);

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

// TODO: プレイヤー管理システムとセーブデータ管理システムは後で実装
// 現在はポケモン管理システムに集中するため、これらのエンドポイントは一時的に無効化

// プレイヤー情報取得（初学者向け：簡易版プレイヤー情報）
app.get('/api/player/:playerId', async (c) => {
  const playerId = c.req.param('playerId');
  
  // 簡易版: 固定のプレイヤー情報を返す
  const 簡易プレイヤー = {
    id: playerId,
    name: 'プレイヤー',
    position: { x: 7, y: 5 },
    direction: 'down' as const,
    sprite: 'player'
  };
  
  return c.json(簡易プレイヤー);
});

// プレイヤー情報作成（初学者向け：簡易版プレイヤー作成）
app.post('/api/player', async (c) => {
  try {
    const body = await c.req.json();
    
    // 簡易版: 新規プレイヤーのデータを作成
    const 新規プレイヤー = {
      id: crypto.randomUUID(),
      name: body.name || 'プレイヤー',
      position: { x: 7, y: 5 },
      direction: 'down' as const,
      sprite: 'player'
    };
    
    return c.json(新規プレイヤー, 201);
  } catch (error) {
    console.error('プレイヤー作成エラー:', error);
    return c.json({ error: 'サーバーエラーが発生しました' }, 500);
  }
});

// プレイヤー位置更新（初学者向け：簡易版位置更新）
app.put('/api/player/:playerId', async (c) => {
  // 簡易版: 常に成功を返す
  return c.json({ success: true });
});

// セーブデータ保存（初学者向け：簡易版セーブ）
app.post('/api/saves/:userId/:slot', async (c) => {
  const slot = parseInt(c.req.param('slot'));
  
  if (slot < 1 || slot > 3) {
    return c.json({ error: '無効なスロット番号です（1〜3を指定してください）' }, 400);
  }
  
  // 簡易版: 常に成功を返す
  const savedAt = new Date().toISOString();
  return c.json({ success: true, savedAt });
});

// 全セーブデータ取得（初学者向け：簡易版セーブ一覧）
app.get('/api/saves/:userId', async (c) => {
  // 簡易版: 空のセーブ一覧を返す
  return c.json({ saves: [] });
});

// 特定スロットのセーブデータ取得（初学者向け：簡易版セーブ取得）
app.get('/api/saves/:userId/:slot', async (c) => {
  // 簡易版: セーブデータが見つからないことを返す
  return c.json({ error: 'セーブデータが見つかりません' }, 404);
});

// セーブデータ削除（初学者向け：簡易版セーブ削除）
app.delete('/api/saves/:userId/:slot', async (c) => {
  // 簡易版: 常に成功を返す
  return c.json({ success: true });
});

export default app;