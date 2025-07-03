// 初学者向け：NPCを表示するコンポーネント
// マップ上にNPCを描画し、クリック可能にするコンポーネントです

import { useEffect, useRef } from 'react';
import { NPCデータ, NPC向き } from '@pokemon-like-game-tutorial/shared';

/**
 * NPCDisplayのプロパティ
 * 初学者向け：親コンポーネントから受け取るデータの型定義です
 */
interface NPCDisplayProps {
  /** 表示するNPCのリスト */
  NPCリスト: NPCデータ[];
  /** タイルのサイズ（ピクセル） */
  タイルサイズ: number;
  /** NPCがクリックされた時のコールバック */
  NPCクリック: (NPC: NPCデータ) => void;
  /** プレイヤーの現在位置（近接チェック用） */
  プレイヤー位置: { x: number; y: number };
}

/**
 * NPCスプライトの色設定
 * 初学者向け：NPCの種類ごとに色分けして識別しやすくします
 */
const NPCスプライト色: Record<string, string> = {
  villager_a: '#4CAF50', // 緑色
  guide: '#2196F3', // 青色
  villager_b: '#FF9800', // オレンジ色
  default: '#9E9E9E', // グレー色（デフォルト）
};

/**
 * NPC表示コンポーネント
 * 初学者向け：マップ上にNPCを描画するコンポーネントです
 */
export default function NPCDisplay({
  NPCリスト,
  タイルサイズ,
  NPCクリック,
  プレイヤー位置,
}: NPCDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * NPCの描画処理
   * 初学者向け：Canvas APIを使ってNPCを描画します
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 各NPCを描画
    NPCリスト.forEach((NPC) => {
      const x = NPC.位置.x * タイルサイズ;
      const y = NPC.位置.y * タイルサイズ;

      // NPCの基本円形を描画
      const 色 = NPCスプライト色[NPC.スプライト] || NPCスプライト色.default;

      ctx.fillStyle = 色;
      ctx.beginPath();
      ctx.arc(x + タイルサイズ / 2, y + タイルサイズ / 2, タイルサイズ * 0.35, 0, 2 * Math.PI);
      ctx.fill();

      // NPCの向きを示す矢印を描画
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${タイルサイズ * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let 矢印文字 = '●';
      switch (NPC.向き) {
        case NPC向き.上:
          矢印文字 = '↑';
          break;
        case NPC向き.下:
          矢印文字 = '↓';
          break;
        case NPC向き.左:
          矢印文字 = '←';
          break;
        case NPC向き.右:
          矢印文字 = '→';
          break;
      }

      ctx.fillText(矢印文字, x + タイルサイズ / 2, y + タイルサイズ / 2);

      // プレイヤーが近くにいる場合は会話アイコンを表示
      const 距離 =
        Math.abs(プレイヤー位置.x - NPC.位置.x) + Math.abs(プレイヤー位置.y - NPC.位置.y);
      if (距離 <= 1) {
        // 会話可能アイコン（吹き出し）
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(
          x + タイルサイズ * 0.8,
          y + タイルサイズ * 0.2,
          タイルサイズ * 0.15,
          0,
          2 * Math.PI
        );
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = `${タイルサイズ * 0.2}px Arial`;
        ctx.fillText('!', x + タイルサイズ * 0.8, y + タイルサイズ * 0.2);
      }
    });
  }, [NPCリスト, タイルサイズ, プレイヤー位置]);

  /**
   * NPCクリック処理
   * 初学者向け：クリック位置からNPCを特定し、コールバックを呼び出します
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // クリック位置のタイル座標を計算
    const タイルX = Math.floor(clickX / タイルサイズ);
    const タイルY = Math.floor(clickY / タイルサイズ);

    // クリックされたタイルにいるNPCを探す
    const クリックされたNPC = NPCリスト.find(
      (NPC) => NPC.位置.x === タイルX && NPC.位置.y === タイルY
    );

    if (クリックされたNPC) {
      // プレイヤーがNPCの隣接タイルにいるかチェック
      const 距離 =
        Math.abs(プレイヤー位置.x - クリックされたNPC.位置.x) +
        Math.abs(プレイヤー位置.y - クリックされたNPC.位置.y);

      if (距離 <= 1) {
        NPCクリック(クリックされたNPC);
      } else {
        // プレイヤーが遠すぎる場合のメッセージ（将来的にはUIで表示）
        console.log('NPCに近づいてから話しかけてください');
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="absolute top-0 left-0 w-[640px] h-[480px] pointer-events-auto cursor-pointer z-10"
      onClick={handleCanvasClick}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
