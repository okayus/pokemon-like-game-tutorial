// サイドバーメニューコンポーネント（初学者向け：ゲームのメニューを左側に配置）
import { useState } from 'react';
import { Button } from './ui/button';
import { Save, FolderOpen, Settings, Menu, X, Clock, User } from 'lucide-react';

interface SidebarMenuProps {
  // プレイヤー情報とゲーム状態
  プレイヤー名: string;
  プレイ時間: string;
  
  // ダイアログ開閉のコールバック関数
  セーブダイアログを開く: () => void;
  ロードダイアログを開く: () => void;
}

export default function SidebarMenu({
  プレイヤー名,
  プレイ時間,
  セーブダイアログを開く,
  ロードダイアログを開く,
}: SidebarMenuProps) {
  const [サイドバー開いている, setサイドバー開いている] = useState(false);

  return (
    <>
      {/* サイドバー開閉ボタン（初学者向け：画面左上のハンバーガーメニュー） */}
      <button
        onClick={() => setサイドバー開いている(true)}
        className="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        data-testid="sidebar-menu-button"
        aria-label="メニューを開く"
      >
        <Menu size={20} />
      </button>

      {/* オーバーレイ（初学者向け：サイドバーが開いているときの背景） */}
      {サイドバー開いている && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setサイドバー開いている(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* サイドバーメニュー本体 */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          サイドバー開いている ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar-menu"
      >
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-300">ゲームメニュー</h2>
          <button
            onClick={() => setサイドバー開いている(false)}
            className="text-gray-400 hover:text-white transition-colors"
            data-testid="sidebar-close-button"
            aria-label="メニューを閉じる"
          >
            <X size={24} />
          </button>
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
            onClick={() => {
              // セーブダイアログを開いてから少し遅延してサイドバーを閉じる（初学者向け：ダイアログが確実に表示されるように）
              セーブダイアログを開く();
              setTimeout(() => setサイドバー開いている(false), 100);
            }}
            className="w-full justify-start space-x-3 bg-green-600 hover:bg-green-700 text-white border-none"
            data-testid="sidebar-save-button"
          >
            <Save size={20} />
            <span>ゲームをセーブ</span>
          </Button>

          {/* ロードボタン */}
          <Button
            onClick={() => {
              // ロードダイアログを開いてから少し遅延してサイドバーを閉じる（初学者向け：ダイアログが確実に表示されるように）
              ロードダイアログを開く();
              setTimeout(() => setサイドバー開いている(false), 100);
            }}
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
      </div>
    </>
  );
}