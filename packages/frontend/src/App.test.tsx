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

describe('App - マップ境界チェック', () => {
  it('プレイヤーが初期位置に表示される', () => {
    render(<App />);

    // 初期位置を確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X}, ${GAME_CONSTANTS.初期位置Y}`
    );
  });

  it('マップの境界内では移動できる', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 右に移動
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X + 1}, ${GAME_CONSTANTS.初期位置Y}`
    );

    // 下に移動
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.初期位置X + 1}, ${GAME_CONSTANTS.初期位置Y + 1}`
    );
  });

  it('左方向の障害物で移動が制限される', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 左に移動を試行（木や水に阻まれるまで）
    // 初期位置 (7, 5) から左に移動すると (6, 5) までしか行けない（水があるため）
    await user.keyboard('{ArrowLeft}');

    // X=6の位置で止まることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 6, ${GAME_CONSTANTS.初期位置Y}`
    );

    // さらに左に移動しようとしても位置は変わらない
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 6, ${GAME_CONSTANTS.初期位置Y}`
    );
  });

  it('右方向の障害物で移動が制限される', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 右に移動を試行（木や水に阻まれるまで）
    // 初期位置 (7, 5) から右に移動すると (8, 5) までしか行けない（水があるため）
    await user.keyboard('{ArrowRight}');

    // X=8の位置で止まることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 8, ${GAME_CONSTANTS.初期位置Y}`
    );

    // さらに右に移動しようとしても位置は変わらない
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: 8, ${GAME_CONSTANTS.初期位置Y}`
    );
  });
});
