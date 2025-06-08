import { useState, useEffect, useCallback } from 'react';
import { GameState, Direction, TILE_SIZE, DIRECTIONS } from '@pokemon-like-game-tutorial/shared';
import GameCanvas from './components/GameCanvas';
import './App.css';

const initialGameState: GameState = {
  currentMap: 'town',
  player: {
    id: '1',
    name: 'Player',
    position: { x: 5, y: 5 },
    direction: 'down',
    sprite: 'player',
  },
  npcs: [],
  isLoading: false,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const movePlayer = useCallback((direction: Direction) => {
    setGameState((prev) => {
      const newPosition = {
        x: prev.player.position.x + DIRECTIONS[direction].x,
        y: prev.player.position.y + DIRECTIONS[direction].y,
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPosition,
          direction,
        },
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePlayer('up');
          break;
        case 'ArrowDown':
          movePlayer('down');
          break;
        case 'ArrowLeft':
          movePlayer('left');
          break;
        case 'ArrowRight':
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Pokemon-like Game
        </h1>
        <GameCanvas gameState={gameState} />
        <div className="mt-4 text-center text-gray-300 text-sm">
          Use arrow keys to move
        </div>
      </div>
    </div>
  );
}

export default App;