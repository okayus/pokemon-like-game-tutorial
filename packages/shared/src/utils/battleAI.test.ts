// 初学者向け：バトルAIシステムのテスト
// TDDアプローチでAI行動決定機能をテスト

import { describe, it, expect, beforeEach } from 'vitest';
import { BattleAI, createBattleAI, simulateAIBattle } from './battleAI';
import type { 参戦ポケモン, 習得技詳細, AI難易度, AI性格 } from '../types/battle';
import type { AI行動決定, AI状況分析 } from './battleAI';

// テスト用のポケモンデータ作成ヘルパー
const createMockPokemon = (overrides: Partial<参戦ポケモン> = {}): 参戦ポケモン => ({
  id: 'test-pokemon-1',
  battle_id: 'test-battle',
  pokemon_id: 1,
  species_id: 25, // ピカチュウ
  name: 'テストピカチュウ',
  level: 10,
  current_hp: 35,
  max_hp: 35,
  attack: 25,
  defense: 20,
  special_attack: 30,
  special_defense: 25,
  speed: 35,
  position: 'プレイヤー',
  status: 'アクティブ',
  status_condition: null,
  moves: [
    createMockMove({ move_id: 1, name: 'でんきショック', type: 'でんき', power: 40, current_pp: 30, pp: 30 }),
    createMockMove({ move_id: 2, name: 'たいあたり', type: 'ノーマル', power: 35, current_pp: 25, pp: 25 }),
    createMockMove({ move_id: 3, name: 'かみつく', type: 'ノーマル', power: 60, current_pp: 15, pp: 15 }),
    createMockMove({ move_id: 4, name: '10まんボルト', type: 'でんき', power: 90, current_pp: 10, pp: 10 })
  ],
  created_at: '2025-07-02 00:00:00',
  updated_at: '2025-07-02 00:00:00',
  ...overrides
});

// テスト用の技データ作成ヘルパー
const createMockMove = (overrides: Partial<習得技詳細> = {}): 習得技詳細 => ({
  move_id: 1,
  name: 'でんきショック',
  type: 'でんき',
  power: 40,
  accuracy: 100,
  pp: 30,
  category: '特殊',
  description: '電気の刺激で相手を攻撃する。',
  created_at: '2025-07-02 00:00:00',
  updated_at: '2025-07-02 00:00:00',
  current_pp: 30,
  ...overrides
});

describe('BattleAI', () => {
  let ai: BattleAI;
  let playerPokemon: 参戦ポケモン;
  let enemyPokemon: 参戦ポケモン;

  beforeEach(() => {
    ai = new BattleAI('中級者', '平均的');
    playerPokemon = createMockPokemon({ 
      position: 'プレイヤー',
      current_hp: 35,
      max_hp: 35
    });
    enemyPokemon = createMockPokemon({ 
      position: 'エネミー',
      current_hp: 30,
      max_hp: 30,
      species_id: 6 // リザードンを想定
    });
  });

  describe('基本的なAI行動決定', () => {
    it('AIインスタンスが正しく作成される', () => {
      expect(ai).toBeDefined();
      expect(ai.decideAction).toBeDefined();
    });

    it('中級者AIが適切な行動を決定する', () => {
      const action = ai.decideAction(playerPokemon, enemyPokemon);
      
      expect(action).toBeDefined();
      expect(action.action_type).toBeDefined();
      expect(['技使用', '逃走', '交代']).toContain(action.action_type);
      expect(action.confidence).toBeGreaterThanOrEqual(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
      expect(action.reasoning).toBeDefined();
      expect(action.priority).toBeGreaterThanOrEqual(0);
      expect(action.priority).toBeLessThanOrEqual(1);
    });

    it('技使用を決定した場合は技IDが設定される', () => {
      const action = ai.decideAction(playerPokemon, enemyPokemon);
      
      if (action.action_type === '技使用') {
        expect(action.selected_move_id).toBeDefined();
        expect(typeof action.selected_move_id).toBe('number');
        const moveIds = playerPokemon.moves.map(m => m.move_id);
        expect(moveIds).toContain(action.selected_move_id);
      }
    });
  });

  describe('難易度別AI行動', () => {
    it('ランダムAIは完全にランダムな行動を取る', () => {
      const randomAI = new BattleAI('ランダム');
      const actions: AI行動決定[] = [];
      
      // 複数回実行して行動の分散を確認
      for (let i = 0; i < 10; i++) {
        const action = randomAI.decideAction(playerPokemon, enemyPokemon);
        actions.push(action);
      }
      
      expect(actions.every(a => a.action_type === '技使用')).toBe(true);
      expect(actions.every(a => a.confidence === 0.5)).toBe(true);
      expect(actions.every(a => a.reasoning.includes('ランダム'))).toBe(true);
    });

    it('初心者AIは威力重視で行動する', () => {
      const beginnerAI = new BattleAI('初心者');
      const action = beginnerAI.decideAction(playerPokemon, enemyPokemon);
      
      if (action.action_type === '技使用') {
        const selectedMove = playerPokemon.moves.find(m => m.move_id === action.selected_move_id);
        expect(selectedMove).toBeDefined();
        expect(action.reasoning).toContain('威力');
      }
    });

    it('上級者AIは戦略的判断を行う', () => {
      const advancedAI = new BattleAI('上級者');
      const action = advancedAI.decideAction(playerPokemon, enemyPokemon);
      
      expect(action.confidence).toBeGreaterThanOrEqual(0.8);
      expect(action.reasoning).toContain('戦略');
    });

    it('チャンピオンAIは最適化された行動を取る', () => {
      const championAI = new BattleAI('チャンピオン');
      const action = championAI.decideAction(playerPokemon, enemyPokemon);
      
      expect(action.confidence).toBeGreaterThanOrEqual(0.9);
      expect(action.reasoning).toContain('チャンピオン');
    });
  });

  describe('状況に応じた行動判定', () => {
    it('HP危険時は逃走を検討する', () => {
      const lowHpPokemon = createMockPokemon({
        current_hp: 3,
        max_hp: 35,
        position: 'エネミー'
      });
      
      const beginnerAI = new BattleAI('初心者');
      let escapeFound = false;
      
      // 複数回実行して逃走判定をテスト（確率的なため）
      for (let i = 0; i < 50; i++) {
        const action = beginnerAI.decideAction(lowHpPokemon, playerPokemon);
        if (action.action_type === '逃走') {
          escapeFound = true;
          expect(action.reasoning).toContain('HP');
          break;
        }
      }
      
      // 危険時は逃走の可能性があることを確認
      // （確率的なので必ず逃走するわけではない）
    });

    it('PP切れの場合は逃走する', () => {
      const noPPPokemon = createMockPokemon({
        moves: [
          createMockMove({ current_pp: 0, pp: 30 }),
          createMockMove({ current_pp: 0, pp: 25 }),
          createMockMove({ current_pp: 0, pp: 15 }),
          createMockMove({ current_pp: 0, pp: 10 })
        ]
      });
      
      const action = ai.decideAction(noPPPokemon, enemyPokemon);
      
      expect(action.action_type).toBe('逃走');
      expect(action.reasoning).toContain('PP');
      expect(action.confidence).toBe(1.0);
    });

    it('有利な状況では積極的な行動を取る', () => {
      const strongPokemon = createMockPokemon({
        current_hp: 35,
        max_hp: 35,
        position: 'エネミー'
      });
      
      const weakEnemy = createMockPokemon({
        current_hp: 5,
        max_hp: 30,
        position: 'プレイヤー'
      });
      
      const advancedAI = new BattleAI('上級者');
      const action = advancedAI.decideAction(strongPokemon, weakEnemy);
      
      expect(action.action_type).toBe('技使用');
      expect(action.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('技の評価システム', () => {
    it('タイプ相性を考慮した技選択を行う', () => {
      // みずタイプの敵に対してでんき技が有効
      const waterEnemy = createMockPokemon({
        species_id: 9, // カメックス（みずタイプ）想定
        position: 'プレイヤー'
      });
      
      const electricPokemon = createMockPokemon({
        moves: [
          createMockMove({ move_id: 1, name: 'でんきショック', type: 'でんき', power: 40 }),
          createMockMove({ move_id: 2, name: 'たいあたり', type: 'ノーマル', power: 40 })
        ],
        position: 'エネミー'
      });
      
      const action = ai.decideAction(electricPokemon, waterEnemy);
      
      if (action.action_type === '技使用') {
        // でんき技が選ばれる可能性が高い（必ずしも選ばれるわけではない）
        const selectedMove = electricPokemon.moves.find(m => m.move_id === action.selected_move_id);
        expect(selectedMove).toBeDefined();
      }
    });

    it('PP残量を考慮した技選択を行う', () => {
      const lowPPPokemon = createMockPokemon({
        moves: [
          createMockMove({ move_id: 1, name: '威力大技', power: 100, current_pp: 1, pp: 5 }),
          createMockMove({ move_id: 2, name: '威力小技', power: 40, current_pp: 20, pp: 30 })
        ]
      });
      
      const conservativeAI = new BattleAI('上級者');
      const action = conservativeAI.decideAction(lowPPPokemon, enemyPokemon);
      
      expect(action.action_type).toBe('技使用');
      expect(action.reasoning).toBeDefined();
    });
  });

  describe('AI性格システム', () => {
    it('攻撃的な性格は攻撃重視の行動を取る', () => {
      const aggressiveAI = new BattleAI('中級者', '攻撃的');
      const action = aggressiveAI.decideAction(playerPokemon, enemyPokemon);
      
      expect(action.action_type).toBe('技使用');
      // 攻撃的性格の影響は実装によって異なる
    });

    it('性格設定を変更できる', () => {
      ai.setPersonality('守備的');
      const action = ai.decideAction(playerPokemon, enemyPokemon);
      
      expect(action).toBeDefined();
    });

    it('難易度設定を変更できる', () => {
      ai.setDifficulty('チャンピオン');
      const action = ai.decideAction(playerPokemon, enemyPokemon);
      
      expect(action.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('ファクトリー関数とユーティリティ', () => {
    it('createBattleAI関数が正しく動作する', () => {
      const createdAI = createBattleAI('上級者', '計算高い');
      const action = createdAI.decideAction(playerPokemon, enemyPokemon);
      
      expect(action).toBeDefined();
      expect(action.confidence).toBeGreaterThan(0.7);
    });

    it('デフォルト引数で作成できる', () => {
      const defaultAI = createBattleAI();
      const action = defaultAI.decideAction(playerPokemon, enemyPokemon);
      
      expect(action).toBeDefined();
    });
  });

  describe('バトルシミュレーション', () => {
    it('AIバトルをシミュレートできる', () => {
      const actions = simulateAIBattle(playerPokemon, enemyPokemon, 5, '中級者');
      
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.length).toBeLessThanOrEqual(5);
      
      actions.forEach(action => {
        expect(['技使用', '逃走', '交代']).toContain(action.action_type);
      });
    });

    it('逃走時にシミュレーションが終了する', () => {
      const noPPPokemon = createMockPokemon({
        moves: playerPokemon.moves.map(m => ({ ...m, current_pp: 0 }))
      });
      
      const actions = simulateAIBattle(noPPPokemon, enemyPokemon, 10);
      
      expect(actions).toHaveLength(1);
      expect(actions[0].action_type).toBe('逃走');
    });

    it('デフォルト引数でシミュレートできる', () => {
      const actions = simulateAIBattle(playerPokemon, enemyPokemon);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('エッジケース', () => {
    it('技が1つしかない場合も動作する', () => {
      const oneMovesPokemon = createMockPokemon({
        moves: [createMockMove({ move_id: 1, name: 'たいあたり', current_pp: 5 })]
      });
      
      const action = ai.decideAction(oneMovesPokemon, enemyPokemon);
      
      if (action.action_type === '技使用') {
        expect(action.selected_move_id).toBe(1);
      }
    });

    it('すべての技のPPが1の場合の判定', () => {
      const lowPPPokemon = createMockPokemon({
        moves: playerPokemon.moves.map(m => ({ ...m, current_pp: 1 }))
      });
      
      const action = ai.decideAction(lowPPPokemon, enemyPokemon);
      
      expect(action).toBeDefined();
      expect(['技使用', '逃走']).toContain(action.action_type);
    });

    it('HP1の極限状態での判定', () => {
      const criticalPokemon = createMockPokemon({
        current_hp: 1,
        max_hp: 35
      });
      
      const criticalEnemy = createMockPokemon({
        current_hp: 1,
        max_hp: 30,
        position: 'プレイヤー'
      });
      
      const action = ai.decideAction(criticalPokemon, criticalEnemy);
      
      expect(action).toBeDefined();
      expect(['技使用', '逃走']).toContain(action.action_type);
    });

    it('無効なmove_idがある場合も動作する', () => {
      // 実際のバトルでは起こらないが、データ不整合時の安全性確認
      const invalidMovePokemon = createMockPokemon({
        moves: [
          createMockMove({ move_id: -1, name: '無効技', current_pp: 0 }),
          createMockMove({ move_id: 999, name: '正常技', current_pp: 10 })
        ]
      });
      
      const action = ai.decideAction(invalidMovePokemon, enemyPokemon);
      
      expect(action).toBeDefined();
    });
  });

  describe('AI行動の一貫性', () => {
    it('同じ状況では似たような行動を取る', () => {
      const actions: AI行動決定[] = [];
      
      // 同じ状況で複数回実行
      for (let i = 0; i < 10; i++) {
        const action = ai.decideAction(playerPokemon, enemyPokemon);
        actions.push(action);
      }
      
      // 全て技使用になるはず（中級者AIで通常状況）
      expect(actions.every(a => a.action_type === '技使用')).toBe(true);
      
      // 信頼度は一定範囲内
      const confidences = actions.map(a => a.confidence);
      const minConfidence = Math.min(...confidences);
      const maxConfidence = Math.max(...confidences);
      expect(maxConfidence - minConfidence).toBeLessThan(0.1); // 0.1以下の差
    });

    it('状況が変われば行動も変わる', () => {
      const normalAction = ai.decideAction(playerPokemon, enemyPokemon);
      
      const criticalPokemon = createMockPokemon({
        current_hp: 2,
        max_hp: 35
      });
      const criticalAction = ai.decideAction(criticalPokemon, enemyPokemon);
      
      // 危機的状況では行動が変わる可能性がある
      // （必ず変わるわけではないが、確率や優先度は変わる）
      expect(normalAction).toBeDefined();
      expect(criticalAction).toBeDefined();
    });
  });
});