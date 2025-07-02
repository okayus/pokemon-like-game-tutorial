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
export * from './utils/battleCalculations';
export * from './data/mapDefinitions';
export * from './data/npcData';
export * from './data/itemBoxData';
export * from './data/moveData';
export * from './types/simple-pokemon';
export * from './types/item';
export * from './types/itemBox';
export * from './types/battle';

// 古いマップデータの再エクスポート（後方互換性のため）
export { マップデータ as 旧マップデータ, 町マップ } from './data/maps';

// 古いタイル型の再エクスポート（後方互換性のため）
export type { タイル情報, タイルタイプ as 旧タイルタイプ } from './types/tile';
export { タイル設定, タイル色設定 as 旧タイル色設定 } from './types/tile';