import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useDialogStore } from '../stores/dialogStore';
import { getNextPosition, isPositionInBounds, Direction, BLOCKING_TILES } from '@pokemon-like-game-tutorial/shared';
import { getMapData } from '../data/maps';
import { getNPCAtPosition } from '../utils/npc';
import { checkMapTransition } from '../utils/mapTransition';

const MOVEMENT_COOLDOWN = 150; // ms

export function usePlayerMovement() {
  const { player, currentMap, gameMode, movePlayer, setPlayerPosition } = useGameStore();
  const { startDialog } = useDialogStore();
  const lastMoveTime = useRef(0);
  const isMoving = useRef(false);
  
  useEffect(() => {
    if (gameMode !== 'explore') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent movement during cooldown
      const now = Date.now();
      if (now - lastMoveTime.current < MOVEMENT_COOLDOWN || isMoving.current) return;
      
      let direction: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
        case 'Enter':
        case ' ':
          handleInteraction();
          return;
      }
      
      if (direction) {
        e.preventDefault();
        moveInDirection(direction);
      }
    };
    
    const moveInDirection = (direction: Direction) => {
      const mapData = getMapData(currentMap);
      if (!mapData) return;
      
      // Update player direction
      movePlayer(direction);
      
      // Calculate next position
      const nextPosition = getNextPosition(player.position, direction);
      
      // Check bounds
      if (!isPositionInBounds(nextPosition, mapData.width, mapData.height)) {
        return;
      }
      
      // Check collision
      const tile = mapData.tiles[nextPosition.y][nextPosition.x];
      if (BLOCKING_TILES.includes(tile)) {
        return;
      }
      
      // Check NPC collision
      const npc = getNPCAtPosition(nextPosition, mapData);
      if (npc) {
        return;
      }
      
      // Move player
      isMoving.current = true;
      lastMoveTime.current = Date.now();
      setPlayerPosition(nextPosition);
      
      // Check for map transitions
      const transition = checkMapTransition(nextPosition, mapData);
      if (transition) {
        useGameStore.getState().changeMap(transition.destination, transition.newPosition);
      }
      
      // Reset moving flag
      setTimeout(() => {
        isMoving.current = false;
      }, MOVEMENT_COOLDOWN);
    };
    
    const handleInteraction = () => {
      const mapData = getMapData(currentMap);
      if (!mapData) return;
      
      // Get position in front of player
      const facingPosition = getNextPosition(player.position, player.direction);
      
      // Check for NPC
      const npc = getNPCAtPosition(facingPosition, mapData);
      if (npc && npc.dialog) {
        startDialog(npc.dialog, npc.name);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameMode, player, currentMap, movePlayer, setPlayerPosition, startDialog]);
}