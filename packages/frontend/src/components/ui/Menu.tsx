import { useGameStore } from '../../stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

export function Menu() {
  const setGameMode = useGameStore((state) => state.setGameMode);
  
  const menuItems = [
    { label: 'ポケモン', action: () => console.log('Pokemon menu') },
    { label: 'バッグ', action: () => console.log('Bag menu') },
    { label: 'プレイヤー', action: () => console.log('Player menu') },
    { label: 'セーブ', action: () => console.log('Save game') },
    { label: 'オプション', action: () => console.log('Options menu') },
    { label: '閉じる', action: () => setGameMode('explore') },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>メニュー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start"
              onClick={item.action}
            >
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}