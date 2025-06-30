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

  it('左端の境界を超えて移動できない', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 左端まで移動
    for (let i = 0; i < GAME_CONSTANTS.初期位置X + 1; i++) {
      await user.keyboard('{ArrowLeft}');
    }
    
    // 左端にいることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent('Player at: 0, ');
    
    // さらに左に移動しようとしても位置は変わらない
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent('Player at: 0, ');
  });

  it('右端の境界を超えて移動できない', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 右端まで移動
    const 移動回数 = GAME_CONSTANTS.マップ幅 - GAME_CONSTANTS.初期位置X - 1;
    for (let i = 0; i < 移動回数 + 1; i++) {
      await user.keyboard('{ArrowRight}');
    }
    
    // 右端にいることを確認
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.マップ幅 - 1}, `
    );
    
    // さらに右に移動しようとしても位置は変わらない
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('game-canvas')).toHaveTextContent(
      `Player at: ${GAME_CONSTANTS.マップ幅 - 1}, `
    );
  });
});