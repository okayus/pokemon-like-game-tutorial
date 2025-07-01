// 初学者向け：マップを表示するコンポーネント
// タイルベースのマップをCanvas要素に描画します

import { useEffect, useRef } from 'react';
import { マップデータ, タイル, タイルタイプ } from '../../../shared/src/types/map';

// タイルのサイズ（ピクセル）
const タイルサイズ = 32;

// タイルタイプごとの色設定
// 初学者向け：各タイルの見た目を色で表現します
const タイル色設定: Record<タイルタイプ, string> = {
  [タイルタイプ.草地]: '#4ade80', // 緑
  [タイルタイプ.道]: '#d4d4d8',   // 灰色
  [タイルタイプ.木]: '#065f46',   // 濃い緑
  [タイルタイプ.水]: '#3b82f6',   // 青
  [タイルタイプ.建物]: '#78716c', // 茶色
  [タイルタイプ.壁]: '#737373',   // 暗い灰色
  [タイルタイプ.岩]: '#a8a29e',   // 薄い茶色
  [タイルタイプ.花]: '#ec4899',   // ピンク
};

interface MapDisplayProps {
  /** 表示するマップデータ */
  マップ: マップデータ;
  /** プレイヤーの現在位置 */
  プレイヤー位置: { x: number; y: number };
  /** マップがクリックされた時の処理 */
  onタイルクリック?: (x: number, y: number) => void;
}

/**
 * マップ表示コンポーネント
 * 初学者向け：Canvas APIを使ってマップを描画します
 */
export default function MapDisplay({ 
  マップ, 
  プレイヤー位置,
  onタイルクリック 
}: MapDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // マップとプレイヤー位置が変更されたら再描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvasのサイズを設定
    canvas.width = マップ.幅 * タイルサイズ;
    canvas.height = マップ.高さ * タイルサイズ;

    // 背景をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // マップのタイルを描画
    for (let y = 0; y < マップ.高さ; y++) {
      for (let x = 0; x < マップ.幅; x++) {
        const タイル = マップ.タイル[y][x];
        描画タイル(ctx, x, y, タイル);

        // 出口の描画（特別なマーカー）
        const 出口 = マップ.出口.find(
          e => e.位置.x === x && e.位置.y === y
        );
        if (出口) {
          描画出口マーカー(ctx, x, y);
        }
      }
    }

    // プレイヤーを描画
    描画プレイヤー(ctx, プレイヤー位置.x, プレイヤー位置.y);

  }, [マップ, プレイヤー位置]);

  /**
   * タイルを描画する関数
   * 初学者向け：1つのタイルを指定された位置に描画します
   */
  function 描画タイル(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    タイル: タイル
  ) {
    // タイルの色を設定
    ctx.fillStyle = タイル色設定[タイル.タイプ] || '#000000';
    
    // タイルを塗りつぶし
    ctx.fillRect(
      x * タイルサイズ, 
      y * タイルサイズ, 
      タイルサイズ, 
      タイルサイズ
    );

    // タイルの境界線を描画
    ctx.strokeStyle = '#00000020';
    ctx.strokeRect(
      x * タイルサイズ, 
      y * タイルサイズ, 
      タイルサイズ, 
      タイルサイズ
    );

    // 草むらの場合は追加の装飾
    if (タイル.草むら) {
      ctx.fillStyle = '#00000020';
      // 草の模様を描画
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(
          x * タイルサイズ + 8 + i * 8,
          y * タイルサイズ + 20,
          2,
          8
        );
      }
    }
  }

  /**
   * 出口マーカーを描画する関数
   * 初学者向け：マップの出口を示す矢印を描画します
   */
  function 描画出口マーカー(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.save();
    ctx.fillStyle = '#fbbf24'; // 黄色
    ctx.globalAlpha = 0.7;
    
    // 矢印を描画
    ctx.beginPath();
    ctx.moveTo(x * タイルサイズ + タイルサイズ / 2, y * タイルサイズ + 8);
    ctx.lineTo(x * タイルサイズ + 8, y * タイルサイズ + 20);
    ctx.lineTo(x * タイルサイズ + タイルサイズ - 8, y * タイルサイズ + 20);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * プレイヤーを描画する関数
   * 初学者向け：プレイヤーキャラクターを円で表現します
   */
  function 描画プレイヤー(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.save();
    
    // プレイヤーの影
    ctx.fillStyle = '#00000040';
    ctx.beginPath();
    ctx.ellipse(
      x * タイルサイズ + タイルサイズ / 2,
      y * タイルサイズ + タイルサイズ - 4,
      10,
      4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // プレイヤー本体
    ctx.fillStyle = '#ef4444'; // 赤
    ctx.beginPath();
    ctx.arc(
      x * タイルサイズ + タイルサイズ / 2,
      y * タイルサイズ + タイルサイズ / 2,
      12,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // プレイヤーの輪郭
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * キャンバスのクリックハンドラー
   * 初学者向け：クリックされた位置をタイル座標に変換します
   */
  function handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!onタイルクリック) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // キャンバス内の相対座標を取得
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // タイル座標に変換
    const タイルX = Math.floor(x / タイルサイズ);
    const タイルY = Math.floor(y / タイルサイズ);

    // 範囲内かチェック
    if (タイルX >= 0 && タイルX < マップ.幅 && 
        タイルY >= 0 && タイルY < マップ.高さ) {
      onタイルクリック(タイルX, タイルY);
    }
  }

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        onClick={handleCanvasClick}
        className="border border-gray-600 cursor-pointer w-[640px] h-[480px]"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* マップ名の表示 */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded">
        {マップ.名前}
      </div>
    </div>
  );
}