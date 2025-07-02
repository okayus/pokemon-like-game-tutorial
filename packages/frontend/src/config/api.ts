// 初学者向け：API設定管理
// 環境に応じたAPI URLを管理

/**
 * 環境変数からAPI基本URLを取得
 * 初学者向け：開発環境とプロダクション環境で異なるAPIサーバーを使用
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

/**
 * 現在の環境を取得
 * 初学者向け：デバッグ情報やログレベル制御に使用
 */
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

/**
 * 開発環境かどうかを判定
 * 初学者向け：開発環境でのみ詳細ログを出力する際に使用
 */
export const isDevelopment = ENVIRONMENT === 'development';

/**
 * プロダクション環境かどうかを判定
 * 初学者向け：本番環境での最適化やエラーハンドリング制御に使用
 */
export const isProduction = ENVIRONMENT === 'production';

/**
 * API エンドポイント構築ヘルパー
 * 初学者向け：APIパスを統一的に管理
 */
export const buildApiUrl = (path: string): string => {
  // パスが /api から始まっていない場合は /api を追加
  const normalizedPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? '' : '/'}${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * 初学者向け：よく使用されるAPIエンドポイント定義
 */
export const API_ENDPOINTS = {
  // ポケモン関連
  POKEMON: {
    SPECIES: buildApiUrl('/pokemon/species'),
    OWNED: (playerId: string) => buildApiUrl(`/pokemon/owned/${playerId}`),
    PARTY: (playerId: string) => buildApiUrl(`/pokemon/party/${playerId}`),
    CAPTURE: buildApiUrl('/pokemon/capture'),
    UPDATE: buildApiUrl('/pokemon/update'),
  },
  
  // アイテム関連
  ITEMS: {
    MASTER: buildApiUrl('/items/master'),
    INVENTORY: (playerId: string) => buildApiUrl(`/items/inventory/${playerId}`),
    BUY: buildApiUrl('/items/buy'),
    USE: buildApiUrl('/items/use'),
  },
  
  // バトル関連
  BATTLE: {
    START: buildApiUrl('/battle/start'),
    MOVE: buildApiUrl('/battle/move'),
    STATUS: (sessionId: string) => buildApiUrl(`/battle/status/${sessionId}`),
    END: buildApiUrl('/battle/end'),
  },
  
  // ヘルスチェック
  HEALTH: buildApiUrl('/health'),
} as const;

/**
 * デバッグ用：設定情報を出力
 * 初学者向け：開発時の設定確認用
 */
export const logApiConfig = () => {
  if (isDevelopment) {
    console.log('🔧 API Configuration:', {
      baseUrl: API_BASE_URL,
      environment: ENVIRONMENT,
      isDevelopment,
      isProduction,
    });
  }
};

// 初学者向け：開発環境では自動的に設定を表示
if (isDevelopment) {
  logApiConfig();
}