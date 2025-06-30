import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { GAME_CONSTANTS } from '@pokemon-like-game-tutorial/shared';

// GameCanvasコンポーネントをモック化（初学者向け：テストでは実際の描画は不要なため）
interface MockGameCanvasProps {
  gameState: {
    player: {
      position: {
        x: number;
        y: number;
      };
    };
  };
}

vi.mock('./components/GameCanvas', () => ({
  default: ({ gameState }: MockGameCanvasProps) => (
    <div data-testid="game-canvas">
      Player at: {gameState.player.position.x}, {gameState.player.position.y}
    </div>
  ),
}));

describe('App - 衝突判定', () => {
  it('障害物に衝突すると移動できない', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 初期位置を確認（中央：7, 5）
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X}, ${GAME_CONSTANTS.初期位置Y}`
    );
    
    // 上に移動を試みる（木があるエリアに向かう）
    // 初期位置から上に移動すると (7, 4) → (7, 3) → (7, 2) → (7, 1) → (7, 0)
    // (7, 0) は木なので、(7, 1) で止まるはず
    
    // 上に4回移動（草地エリア内）
    for (let i = 0; i < 4; i++) {
      await user.keyboard('{ArrowUp}');
    }
    
    // Y=1の位置にいることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X}, 1`
    );
    
    // さらに上に移動しようとしても木があるので移動できない
    await user.keyboard('{ArrowUp}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X}, 1`
    );
  });

  it('左の水に衝突すると移動できない', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 初期位置から左に移動を試みる
    // (7, 5) → (6, 5) → (5, 5) は水なので移動不可
    // (6, 5) で止まるはず
    
    // 左に1回移動
    await user.keyboard('{ArrowLeft}');
    
    // X=6の位置にいることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 6, ${GAME_CONSTANTS.初期位置Y}`
    );
    
    // さらに左に移動しようとしても水があるので移動できない
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 6, ${GAME_CONSTANTS.初期位置Y}`
    );
  });

  it('水に入ることができない', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 初期位置から水エリアに移動を試みる
    // (7, 5) → (6, 5) → (5, 5) は水なので移動不可
    // この動作は上のテストと同じなので削除するか、別の方向での水のテストにする
    
    // 右に移動して水に近づく
    // (7, 5) → (8, 5) → (9, 5) は水なので移動不可
    // (8, 5) で止まるはず
    
    // 右に1回移動
    await user.keyboard('{ArrowRight}');
    
    // X=8の位置にいることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 8, ${GAME_CONSTANTS.初期位置Y}`
    );
    
    // さらに右に移動しようとしても水があるので移動できない
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 8, ${GAME_CONSTANTS.初期位置Y}`
    );
  });
});