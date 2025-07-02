// 初学者向け：バトルAIシステム
// 敵ポケモンの行動を決定するAI

import type { 参戦ポケモン, 習得技詳細, 技タイプ } from '../types/battle';
import { calculateTypeEffectiveness } from './typeEffectiveness';
import { PPManager } from './ppManager';

/**
 * AIの難易度レベル
 * 初学者向け：AIの行動パターンの複雑さ
 */
export type AI難易度 = 
  | 'ランダム'     // 完全にランダムな行動
  | '初心者'       // 基本的な戦略のみ
  | '中級者'       // タイプ相性を考慮
  | '上級者'       // 高度な戦略を使用
  | 'チャンピオン'; // 最適化された行動

/**
 * AIの行動種別
 * 初学者向け：AIが取りうる行動の種類
 */
export type AI行動種別 = 
  | '技使用'       // 技を使用する
  | '逃走'         // バトルから逃げる（野生のみ）
  | '交代';        // ポケモンを交代する（未実装）

/**
 * AIの行動決定結果
 * 初学者向け：AIが決定した行動の詳細
 */
export interface AI行動決定 {
  action_type: AI行動種別;       // 行動の種類
  selected_move_id?: number;     // 選択した技のID
  confidence: number;            // 行動への確信度（0-1）
  reasoning: string;             // 判断理由（デバッグ用）
  priority: number;              // 行動の優先度
}

/**
 * AIの状況分析結果
 * 初学者向け：現在のバトル状況をAIがどう認識しているか
 */
export interface AI状況分析 {
  my_hp_percentage: number;      // 自分のHP割合
  enemy_hp_percentage: number;   // 相手のHP割合
  my_advantage: boolean;         // 自分が有利かどうか
  should_be_aggressive: boolean; // 積極的に攻めるべきか
  should_be_defensive: boolean;  // 守備的になるべきか
  critical_situation: boolean;   // 危機的状況かどうか
}

/**
 * 技の評価結果
 * 初学者向け：各技をAIがどう評価しているか
 */
export interface 技評価 {
  move: 習得技詳細;            // 評価対象の技
  damage_score: number;        // ダメージ効果の評価（0-100）
  type_effectiveness_score: number; // タイプ相性の評価（0-100）
  pp_score: number;            // PP残量の評価（0-100）
  total_score: number;         // 総合評価（0-100）
  is_recommended: boolean;     // 推奨技かどうか
}

/**
 * バトルAIクラス
 * 初学者向け：敵ポケモンの行動を決定するメインシステム
 */
export class BattleAI {
  private difficulty: AI難易度;
  private personality: AI性格;

  constructor(difficulty: AI難易度 = '中級者', personality: AI性格 = '平均的') {
    this.difficulty = difficulty;
    this.personality = personality;
  }

  /**
   * AIの行動を決定する
   * 初学者向け：現在の状況から最適な行動を選択
   */
  decideAction(
    myPokemon: 参戦ポケモン,
    enemyPokemon: 参戦ポケモン,
    _battleType: '野生' | 'トレーナー' = '野生'
  ): AI行動決定 {
    // 状況分析
    const situation = this.analyzeSituation(myPokemon, enemyPokemon);
    
    // 難易度に応じた行動決定
    switch (this.difficulty) {
      case 'ランダム':
        return this.randomAction(myPokemon);
      
      case '初心者':
        return this.beginnerAction(myPokemon, enemyPokemon, situation, _battleType);
      
      case '中級者':
        return this.intermediateAction(myPokemon, enemyPokemon, situation, _battleType);
      
      case '上級者':
        return this.advancedAction(myPokemon, enemyPokemon, situation);
      
      case 'チャンピオン':
        return this.championAction(myPokemon, enemyPokemon, situation);
      
      default:
        return this.intermediateAction(myPokemon, enemyPokemon, situation, _battleType);
    }
  }

  /**
   * 状況分析を行う
   * 初学者向け：現在のバトル状況を数値化して分析
   */
  private analyzeSituation(myPokemon: 参戦ポケモン, enemyPokemon: 参戦ポケモン): AI状況分析 {
    const myHpPercentage = myPokemon.current_hp / myPokemon.max_hp;
    const enemyHpPercentage = enemyPokemon.current_hp / enemyPokemon.max_hp;
    
    const myAdvantage = myHpPercentage > enemyHpPercentage * 1.2; // 20%以上HP差があれば有利
    const shouldBeAggressive = myHpPercentage > 0.7 && enemyHpPercentage < 0.5;
    const shouldBeDefensive = myHpPercentage < 0.3;
    const criticalSituation = myHpPercentage < 0.2 || enemyHpPercentage < 0.2;

    return {
      my_hp_percentage: myHpPercentage,
      enemy_hp_percentage: enemyHpPercentage,
      my_advantage: myAdvantage,
      should_be_aggressive: shouldBeAggressive,
      should_be_defensive: shouldBeDefensive,
      critical_situation: criticalSituation
    };
  }

  /**
   * 技を評価する
   * 初学者向け：各技の有効性を数値化
   */
  private evaluateMoves(
    myPokemon: 参戦ポケモン, 
    enemyPokemon: 参戦ポケモン
  ): 技評価[] {
    return myPokemon.moves.map(move => {
      // ダメージスコア（技威力）
      const damageScore = Math.min(100, (move.power / 120) * 100);
      
      // タイプ相性スコア
      const typeResult = calculateTypeEffectiveness(move.type, enemyPokemon.species_id.toString() as unknown as 技タイプ);
      const typeScore = typeResult.multiplier * 50; // 0-100スケール
      
      // PPスコア（残りPP率）
      const ppStatus = PPManager.getPPStatus(move);
      const ppScore = ppStatus.pp_percentage * 100;
      
      // 総合スコア（重み付き平均）
      const totalScore = (damageScore * 0.4) + (typeScore * 0.4) + (ppScore * 0.2);
      
      return {
        move,
        damage_score: damageScore,
        type_effectiveness_score: typeScore,
        pp_score: ppScore,
        total_score: totalScore,
        is_recommended: totalScore > 60
      };
    });
  }

  /**
   * ランダム行動（最も簡単なAI）
   * 初学者向け：完全にランダムな技選択
   */
  private randomAction(myPokemon: 参戦ポケモン): AI行動決定 {
    const usableMoves = myPokemon.moves.filter(move => move.current_pp > 0);
    
    if (usableMoves.length === 0) {
      return {
        action_type: '逃走',
        confidence: 1.0,
        reasoning: 'PPが切れたため逃走',
        priority: 1
      };
    }

    const randomMove = usableMoves[Math.floor(Math.random() * usableMoves.length)];
    
    return {
      action_type: '技使用',
      selected_move_id: randomMove.move_id,
      confidence: 0.5,
      reasoning: 'ランダムに技を選択',
      priority: Math.random()
    };
  }

  /**
   * 初心者AI（基本的な判断のみ）
   * 初学者向け：威力の高い技を優先する簡単なAI
   */
  private beginnerAction(
    myPokemon: 参戦ポケモン, 
    enemyPokemon: 参戦ポケモン, 
    situation: AI状況分析,
    _battleType: '野生' | 'トレーナー'
  ): AI行動決定 {
    const usableMoves = myPokemon.moves.filter(move => move.current_pp > 0);
    
    if (usableMoves.length === 0) {
      return {
        action_type: '逃走',
        confidence: 1.0,
        reasoning: 'PPが切れたため逃走',
        priority: 1
      };
    }

    // HP危険時は逃走を検討（野生のみ）
    if (_battleType === '野生' && situation.my_hp_percentage < 0.1 && Math.random() < 0.3) {
      return {
        action_type: '逃走',
        confidence: 0.7,
        reasoning: 'HPが危険なため逃走',
        priority: 0.9
      };
    }

    // 威力が最も高い技を選択
    const bestMove = usableMoves.reduce((best, current) => 
      current.power > best.power ? current : best
    );

    return {
      action_type: '技使用',
      selected_move_id: bestMove.move_id,
      confidence: 0.6,
      reasoning: `最も威力の高い技「${bestMove.name}」を選択`,
      priority: 0.6
    };
  }

  /**
   * 中級AI（タイプ相性を考慮）
   * 初学者向け：タイプ相性を理解する標準的なAI
   */
  private intermediateAction(
    myPokemon: 参戦ポケモン, 
    enemyPokemon: 参戦ポケモン, 
    situation: AI状況分析,
    _battleType: '野生' | 'トレーナー'
  ): AI行動決定 {
    const moveEvaluations = this.evaluateMoves(myPokemon, enemyPokemon);
    const usableEvaluations = moveEvaluations.filter(evaluation => evaluation.move.current_pp > 0);
    
    if (usableEvaluations.length === 0) {
      return {
        action_type: '逃走',
        confidence: 1.0,
        reasoning: 'PPが切れたため逃走',
        priority: 1
      };
    }

    // 危機的状況での逃走判定（野生のみ）
    if (_battleType === '野生' && situation.critical_situation && situation.my_hp_percentage < 0.15 && Math.random() < 0.4) {
      return {
        action_type: '逃走',
        confidence: 0.8,
        reasoning: '危機的状況のため逃走',
        priority: 0.9
      };
    }

    // 評価の高い技を選択
    const bestEvaluation = usableEvaluations.reduce((best, current) => 
      current.total_score > best.total_score ? current : best
    );

    return {
      action_type: '技使用',
      selected_move_id: bestEvaluation.move.move_id,
      confidence: 0.7,
      reasoning: `総合評価最高の技「${bestEvaluation.move.name}」を選択（スコア: ${bestEvaluation.total_score.toFixed(1)}）`,
      priority: 0.7
    };
  }

  /**
   * 上級AI（高度な戦略を使用）
   * 初学者向け：複雑な判断ができる高性能AI
   */
  private advancedAction(
    myPokemon: 参戦ポケモン, 
    enemyPokemon: 参戦ポケモン, 
    situation: AI状況分析
  ): AI行動決定 {
    const moveEvaluations = this.evaluateMoves(myPokemon, enemyPokemon);
    const usableEvaluations = moveEvaluations.filter(evaluation => evaluation.move.current_pp > 0);
    
    if (usableEvaluations.length === 0) {
      return {
        action_type: '逃走',
        confidence: 1.0,
        reasoning: 'PPが切れたため逃走',
        priority: 1
      };
    }

    // 状況に応じた戦略調整
    let selectedEvaluation: 技評価;

    if (situation.should_be_aggressive) {
      // 攻撃的：最大ダメージ重視
      selectedEvaluation = usableEvaluations.reduce((best, current) => 
        (current.damage_score + current.type_effectiveness_score) > 
        (best.damage_score + best.type_effectiveness_score) ? current : best
      );
    } else if (situation.should_be_defensive) {
      // 守備的：PP温存重視
      selectedEvaluation = usableEvaluations.reduce((best, current) => 
        current.pp_score > best.pp_score ? current : best
      );
    } else {
      // バランス重視：総合評価
      selectedEvaluation = usableEvaluations.reduce((best, current) => 
        current.total_score > best.total_score ? current : best
      );
    }

    return {
      action_type: '技使用',
      selected_move_id: selectedEvaluation.move.move_id,
      confidence: 0.8,
      reasoning: `戦略的判断により「${selectedEvaluation.move.name}」を選択`,
      priority: 0.8
    };
  }

  /**
   * チャンピオンAI（最適化された行動）
   * 初学者向け：最高レベルの判断力を持つAI
   */
  private championAction(
    myPokemon: 参戦ポケモン, 
    enemyPokemon: 参戦ポケモン, 
    situation: AI状況分析
  ): AI行動決定 {
    const moveEvaluations = this.evaluateMoves(myPokemon, enemyPokemon);
    const usableEvaluations = moveEvaluations.filter(evaluation => evaluation.move.current_pp > 0);
    
    if (usableEvaluations.length === 0) {
      return {
        action_type: '逃走',
        confidence: 1.0,
        reasoning: 'PPが切れたため逃走',
        priority: 1
      };
    }

    // 高度な計算による最適化
    const optimizedEvaluations = usableEvaluations.map(evaluation => {
      let adjustedScore = evaluation.total_score;

      // 状況に応じた調整
      if (situation.critical_situation) {
        adjustedScore += evaluation.damage_score * 0.3; // 危機時はダメージ重視
      }
      
      if (situation.should_be_aggressive) {
        adjustedScore += evaluation.type_effectiveness_score * 0.2; // 攻撃時は相性重視
      }

      // PP温存ボーナス
      if (evaluation.pp_score > 80) {
        adjustedScore += 10;
      }

      return {
        ...evaluation,
        adjusted_score: adjustedScore
      };
    });

    const bestEvaluation = optimizedEvaluations.reduce((best, current) => 
      current.adjusted_score > best.adjusted_score ? current : best
    );

    return {
      action_type: '技使用',
      selected_move_id: bestEvaluation.move.move_id,
      confidence: 0.9,
      reasoning: `チャンピオンレベルの判断により「${bestEvaluation.move.name}」を選択`,
      priority: 0.9
    };
  }

  /**
   * AIの性格を設定する
   * 初学者向け：AIの行動パターンをカスタマイズ
   */
  setPersonality(personality: AI性格): void {
    this.personality = personality;
  }

  /**
   * AIの難易度を変更する
   * 初学者向け：ゲーム進行に応じてAIを調整
   */
  setDifficulty(difficulty: AI難易度): void {
    this.difficulty = difficulty;
  }
}

/**
 * AIの性格タイプ
 * 初学者向け：AIの行動傾向をパーソナライズ
 */
export type AI性格 = 
  | '攻撃的'    // 常に攻撃を優先
  | '守備的'    // 安全な行動を優先
  | '計算高い'  // 効率を最重視
  | '平均的';   // バランスの取れた行動

/**
 * AIファクトリー関数
 * 初学者向け：簡単にAIインスタンスを作成
 */
export function createBattleAI(
  difficulty: AI難易度 = '中級者', 
  personality: AI性格 = '平均的'
): BattleAI {
  return new BattleAI(difficulty, personality);
}

/**
 * AIの行動をシミュレートする
 * 初学者向け：テスト用のAI行動シミュレーション
 */
export function simulateAIBattle(
  aiPokemon: 参戦ポケモン,
  playerPokemon: 参戦ポケモン,
  turns: number = 10,
  difficulty: AI難易度 = '中級者'
): AI行動決定[] {
  const ai = new BattleAI(difficulty);
  const actions: AI行動決定[] = [];

  for (let i = 0; i < turns; i++) {
    const action = ai.decideAction(aiPokemon, playerPokemon);
    actions.push(action);
    
    // 逃走したらシミュレーション終了
    if (action.action_type === '逃走') {
      break;
    }
  }

  return actions;
}

export default BattleAI;