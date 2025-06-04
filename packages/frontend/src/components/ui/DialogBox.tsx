import { useEffect } from 'react';
import { useDialogStore } from '../../stores/dialogStore';
import { Card, CardContent } from './card';
import { Button } from './button';

export function DialogBox() {
  const { currentDialog, dialogIndex, speaker, nextDialog, closeDialog } = useDialogStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nextDialog();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextDialog, closeDialog]);
  
  if (!currentDialog) return null;
  
  const isLastMessage = dialogIndex >= currentDialog.length - 1;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-800">
        <CardContent className="p-6">
          {speaker && (
            <p className="font-bold text-sm text-gray-600 mb-2">{speaker}</p>
          )}
          <p className="text-lg whitespace-pre-wrap">
            {currentDialog[dialogIndex]}
          </p>
          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              onClick={nextDialog}
              className="animate-pulse"
            >
              {isLastMessage ? '閉じる' : '次へ ▶'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}