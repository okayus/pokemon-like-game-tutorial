export * from './types/game';
export * from './types/character';
export * from './types/map';
export * from './types/save';
export * from './types/npc';
export * from './constants/game';
export * from './constants/tiles';
export * from './constants';
export * from './game/mapBoundary';
export * from './game/collisionDetection';
export * from './data/mapDefinitions';
export * from './data/npcData';

// 古いマップデータの再エクスポート（後方互換性のため）
export { マップデータ as 旧マップデータ, 町マップ } from './data/maps';

// 古いタイル型の再エクスポート（後方互換性のため）
export type { タイル情報, タイルタイプ as 旧タイルタイプ } from './types/tile';
export { タイル設定, タイル色設定 as 旧タイル色設定 } from './types/tile';