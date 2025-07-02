// 初学者向け：バトル画面コンポーネント
// ポケモンバトルのメイン画面を表示

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBattle } from '../contexts/BattleContext';
import { HPBar } from '../components/HPBar';
import { MoveSelector } from '../components/MoveSelector';
import { MoveEffect } from '../components/MoveEffect';
import { DamageNumber, BattleMessage } from '../components/DamageNumber';
import { BattleTransition } from '../components/BattleTransition';
import type { バトル開始リクエスト } from '@pokemon-like-game-tutorial/shared';

/**
 * バトル画面コンポーネント
 * 初学者向け：ポケモンバトルのメイン画面
 */
export function BattlePage() {
  const navigate = useNavigate();
  const { playerPokemonId, enemyPokemonId } = useParams();
  const [searchParams] = useSearchParams();
  const battleType = searchParams.get('type') as '野生' | 'トレーナー' || '野生';

  // アニメーション状態管理
  const [showBattleStart, setShowBattleStart] = useState(false);
  const [showMoveEffect, setShowMoveEffect] = useState(false);
  const [showDamageNumber, setShowDamageNumber] = useState(false);
  const [lastDamage, setLastDamage] = useState<number>(0);
  const [battleMessage, setBattleMessage] = useState<string>('');
  const [showTransition, setShowTransition] = useState(false);

  const {
    現在バトル,
    読み込み中,
    エラーメッセージ,
    選択中技,
    アニメーション中,
    メッセージ表示中,
    バトル開始,
    技使用,
    バトル終了,
    技選択,
    エラークリア
  } = useBattle();

  // バトル開始処理
  useEffect(() => {
    if (!playerPokemonId || !enemyPokemonId) {
      navigate('/');
      return;
    }

    if (!現在バトル && !読み込み中) {
      // バトル開始演出を表示
      setShowBattleStart(true);
    }
  }, [playerPokemonId, enemyPokemonId, battleType, 現在バトル, 読み込み中, navigate]);

  // バトル開始演出完了後の処理
  const handleBattleStartComplete = async () => {
    setShowBattleStart(false);
    
    const request: バトル開始リクエスト = {
      player_id: 'player-001', // TODO: 実際のプレイヤーIDを取得
      player_pokemon_id: playerPokemonId!,
      enemy_pokemon_id: enemyPokemonId!,
      battle_type: battleType
    };

    await バトル開始(request);
  };

  // バトルメッセージとアニメーション更新
  useEffect(() => {
    if (現在バトル?.recent_logs && 現在バトル.recent_logs.length > 0) {
      const latestMessage = 現在バトル.recent_logs[現在バトル.recent_logs.length - 1];
      setBattleMessage(latestMessage);
      
      // ダメージを推測（メッセージから数値を抽出）
      const damageMatch = latestMessage.match(/(\d+)のダメージ/);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        setLastDamage(damage);
        setShowDamageNumber(true);
        setShowMoveEffect(true);
      }
    }
  }, [現在バトル?.recent_logs]);

  // エラー表示
  if (エラーメッセージ) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
          <p className="text-gray-700 mb-4">{エラーメッセージ}</p>
          <div className="flex space-x-2">
            <button
              onClick={エラークリア}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              再試行
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 読み込み中表示
  if (読み込み中 || !現在バトル) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-lg font-medium text-gray-700">バトルを開始しています...</p>
          </div>
        </div>
      </div>
    );
  }

  const { player_pokemon, enemy_pokemon, session } = 現在バトル;

  // 技選択ハンドラー
  const handleMoveSelect = (moveId: number) => {
    if (アニメーション中) return;
    技選択(moveId);
  };

  // 技使用ハンドラー
  const handleMoveUse = async () => {
    if (!選択中技 || アニメーション中) return;
    await 技使用(選択中技);
  };

  // バトル終了ハンドラー
  const handleBattleEnd = async () => {
    setShowTransition(true);
    await バトル終了('プレイヤーが逃げ出した');
  };

  // バトル終了演出完了ハンドラー
  const handleBattleEndComplete = () => {
    setShowTransition(false);
    navigate('/');
  };

  // アニメーション完了ハンドラー
  const handleMoveEffectComplete = () => {
    setShowMoveEffect(false);
  };

  const handleDamageComplete = () => {
    setShowDamageNumber(false);
  };

  // バトル終了判定
  if (session.status === '終了') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {session.winner === 'プレイヤー' ? '勝利！' : 
             session.winner === '敵' ? '敗北...' : '引き分け'}
          </h2>
          <p className="text-gray-700 mb-6">
            {session.winner === 'プレイヤー' ? 
              `${enemy_pokemon.name}を倒した！` :
              session.winner === '敵' ?
              `${player_pokemon.name}は戦闘不能になった...` :
              'バトルは引き分けに終わった'
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 relative">
      {/* バトル開始演出 */}
      {showBattleStart && (
        <BattleTransition
          type="バトル開始"
          isVisible={true}
          playerName="プレイヤー"
          enemyName={enemyPokemonId}
          onComplete={handleBattleStartComplete}
        />
      )}

      {/* バトル終了演出 */}
      {showTransition && (
        <BattleTransition
          type="逃走"
          isVisible={true}
          onComplete={handleBattleEndComplete}
        />
      )}

      {/* バトル画面ヘッダー */}
      <div className="bg-slate-800 text-white p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">
            {battleType === '野生' ? '野生ポケモンとのバトル' : 'トレーナーバトル'}
          </h1>
          <div className="text-sm">
            ターン: {session.current_turn}
          </div>
        </div>
      </div>

      {/* バトルフィールド */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          
          {/* 敵ポケモン表示エリア */}
          <div className="flex justify-end mb-8">
            <div className="text-center relative">
              {/* 敵ポケモンのスプライト */}
              <div className="mb-4 relative">
                <img
                  src={enemy_pokemon.sprite_url}
                  alt={enemy_pokemon.name}
                  className="w-32 h-32 mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
                
                {/* 技エフェクト */}
                {showMoveEffect && (
                  <MoveEffect
                    type="でんき"
                    isVisible={true}
                    position="target"
                    onComplete={handleMoveEffectComplete}
                  />
                )}
                
                {/* ダメージ数値 */}
                {showDamageNumber && (
                  <DamageNumber
                    damage={lastDamage}
                    type="通常"
                    isVisible={true}
                    startPosition={{ x: 50, y: 30 }}
                    onComplete={handleDamageComplete}
                  />
                )}
              </div>
              {/* 敵ポケモンのHPバー */}
              <HPBar
                currentHP={enemy_pokemon.current_hp}
                maxHP={enemy_pokemon.max_hp}
                pokemonName={`${enemy_pokemon.name} Lv.${enemy_pokemon.level}`}
                size="large"
                animated={true}
              />
            </div>
          </div>

          {/* 中央のバトルメッセージエリア */}
          <div className="my-8 relative">
            {/* バトルメッセージコンポーネント */}
            {battleMessage && (
              <BattleMessage
                message={battleMessage}
                isVisible={メッセージ表示中}
                onComplete={() => setBattleMessage('')}
              />
            )}
          </div>

          {/* プレイヤーポケモン表示エリア */}
          <div className="flex justify-start">
            <div className="text-center">
              {/* プレイヤーポケモンのHPバー */}
              <HPBar
                currentHP={player_pokemon.current_hp}
                maxHP={player_pokemon.max_hp}
                pokemonName={`${player_pokemon.name} Lv.${player_pokemon.level}`}
                size="large"
                animated={true}
              />
              {/* プレイヤーポケモンのスプライト */}
              <div className="mt-4">
                <img
                  src={player_pokemon.sprite_url}
                  alt={player_pokemon.name}
                  className="w-32 h-32 mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コマンド選択エリア */}
      <div className="bg-slate-800 text-white p-4">
        <div className="max-w-4xl mx-auto">
          {session.phase === 'コマンド選択' && !アニメーション中 && (
            <div>
              <h3 className="text-lg font-bold mb-4">
                {player_pokemon.name}は何をする？
              </h3>
              
              {/* 技選択コンポーネント */}
              <div className="mb-4">
                <MoveSelector
                  moves={player_pokemon.moves}
                  selectedMoveId={選択中技}
                  onMoveSelect={技選択}
                  disabled={アニメーション中}
                  showDetails={true}
                />
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-3">
                <button
                  onClick={handleMoveUse}
                  disabled={!選択中技}
                  className={`
                    flex-1 py-3 px-6 rounded-lg font-bold transition-colors
                    ${選択中技
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  技を使う
                </button>
                <button
                  onClick={handleBattleEnd}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                >
                  にげる
                </button>
              </div>
            </div>
          )}

          {/* アニメーション中の表示 */}
          {アニメーション中 && (
            <div className="text-center py-8">
              <div className="animate-pulse text-lg font-medium">
                技を実行中...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattlePage;