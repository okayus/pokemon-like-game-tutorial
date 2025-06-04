import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGameStore } from '../../stores/gameStore';

export function BattleScreen() {
  const setGameMode = useGameStore((state) => state.setGameMode);
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-400 to-green-400">
      {/* Enemy Area */}
      <div className="absolute top-10 right-10">
        <Card className="p-4">
          <h3 className="font-bold">Wild Pokémon</h3>
          <div className="w-32 h-32 bg-gray-300 rounded-lg mt-2" />
          <div className="mt-2">
            <div className="text-sm">HP</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Player Area */}
      <div className="absolute bottom-10 left-10">
        <Card className="p-4">
          <h3 className="font-bold">Your Pokémon</h3>
          <div className="w-32 h-32 bg-gray-300 rounded-lg mt-2" />
          <div className="mt-2">
            <div className="text-sm">HP</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Battle Menu */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline">たたかう</Button>
            <Button variant="outline">バッグ</Button>
            <Button variant="outline">ポケモン</Button>
            <Button variant="outline" onClick={() => setGameMode('explore')}>にげる</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}