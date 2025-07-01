// 初学者向け：共通ヘッダーコンポーネント
// アプリケーション全体で使用する統一されたナビゲーションヘッダー

import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  /** リンク先のパス */
  to: string;
  /** 表示するアイコン（絵文字） */
  icon: string;
  /** 表示するラベルテキスト */
  label: string;
  /** 現在のパスがアクティブかどうか */
  isActive: boolean;
}

/**
 * ナビゲーション項目コンポーネント
 * 初学者向け：再利用可能なナビゲーションリンク
 */
function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`
        inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-blue-600 hover:bg-blue-50'
        }
      `}
    >
      <span className="mr-2" role="img" aria-label={label}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

/**
 * 共通ヘッダーコンポーネント
 * 初学者向け：全ページで統一されたナビゲーション体験を提供
 */
export function CommonHeader() {
  const location = useLocation();
  
  // 現在のパスに基づいてアクティブな項目を判定
  const isActivePath = (path: string) => {
    if (path === '/game') {
      // マップ関連のパスをすべてマップとして扱う
      return location.pathname === '/game' || location.pathname.startsWith('/map/');
    }
    return location.pathname === path;
  };
  
  // ナビゲーション項目の定義
  const navigationItems = [
    {
      to: '/game',
      icon: '🗺️',
      label: 'マップ',
      isActive: isActivePath('/game')
    },
    {
      to: '/pokemon/dex',
      icon: '📖',
      label: '図鑑',
      isActive: isActivePath('/pokemon/dex')
    },
    {
      to: '/pokemon/owned',
      icon: '🎒',
      label: '手持ち',
      isActive: isActivePath('/pokemon/owned')
    },
    {
      to: '/pokemon/party',
      icon: '⚔️',
      label: 'パーティ',
      isActive: isActivePath('/pokemon/party')
    }
  ];
  
  return (
    <header role="banner" className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* アプリケーションロゴ・タイトル */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-2xl mr-2" role="img" aria-label="ゲームアイコン">
                🎮
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                ポケモンライクゲーム
              </h1>
            </Link>
          </div>
          
          {/* ナビゲーションメニュー */}
          <nav role="navigation" className="flex items-center space-x-2 md:space-x-4">
            {navigationItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
              />
            ))}
          </nav>
        </div>
        
        {/* モバイル向けの説明テキスト（小さい画面では非表示） */}
        <div className="hidden md:block mt-2">
          <p className="text-sm text-gray-600">
            初学者向けのプログラミング学習用ゲームです
          </p>
        </div>
      </div>
    </header>
  );
}