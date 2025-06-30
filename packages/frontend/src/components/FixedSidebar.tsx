// 固定サイドバーコンポーネント（初学者向け：常に表示されるサイドメニュー）
import { Button } from './ui/button';
import { Save, FolderOpen, Settings, Clock, User } from 'lucide-react';

interface FixedSidebarProps {
  // プレイヤー情報とゲーム状態
  プレイヤー名: string;
  プレイ時間: string;
  
  // ダイアログ開閉のコールバック関数
  セーブダイアログを開く: () => void;
  ロードダイアログを開く: () => void;
}

export default function FixedSidebar({
  プレイヤー名,
  プレイ時間,
  セーブダイアログを開く,
  ロードダイアログを開く,
}: FixedSidebarProps) {
  return (
    <aside className="bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full overflow-y-auto">
      {/* ヘッダー部分 */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-blue-300">ゲームメニュー</h2>
      </div>

      {/* プレイヤー情報セクション */}
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-green-300">プレイヤー情報</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <User size={16} className="text-blue-400" />
            <span className="text-sm">{プレイヤー名}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-sm">{プレイ時間}</span>
          </div>
        </div>
      </div>

      {/* メニューボタンセクション */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-purple-300">ゲーム操作</h3>
        
        {/* セーブボタン */}
        <Button
          onClick={セーブダイアログを開く}
          className="w-full justify-start space-x-3 bg-green-600 hover:bg-green-700 text-white border-none"
          data-testid="sidebar-save-button"
        >
          <Save size={20} />
          <span>ゲームをセーブ</span>
        </Button>

        {/* ロードボタン */}
        <Button
          onClick={ロードダイアログを開く}
          className="w-full justify-start space-x-3 bg-blue-600 hover:bg-blue-700 text-white border-none"
          data-testid="sidebar-load-button"
        >
          <FolderOpen size={20} />
          <span>ゲームをロード</span>
        </Button>

        {/* 設定ボタン（将来の拡張用） */}
        <Button
          disabled
          className="w-full justify-start space-x-3 bg-gray-600 text-gray-400 border-none cursor-not-allowed"
          data-testid="sidebar-settings-button"
        >
          <Settings size={20} />
          <span>設定（未実装）</span>
        </Button>
      </div>

      {/* キーボードショートカット説明 */}
      <div className="p-6 border-t border-slate-700">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">キーボードショートカット</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>移動</span>
            <span>矢印キー</span>
          </div>
          <div className="flex justify-between">
            <span>セーブ</span>
            <span>S キー</span>
          </div>
          <div className="flex justify-between">
            <span>ロード</span>
            <span>L キー</span>
          </div>
        </div>
      </div>
    </aside>
  );
}