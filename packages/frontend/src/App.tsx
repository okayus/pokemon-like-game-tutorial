// 初学者向け：メインのAppコンポーネント
// React Routerを使用してページのルーティングを管理します

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import { デフォルト開始マップID } from '../../shared/src/data/mapDefinitions';
import './App.css';

/**
 * メインのAppコンポーネント
 * 初学者向け：ルーティングシステムでページを管理します
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ホームページ（ゲーム開始画面） */}
        <Route path="/" element={<HomePage />} />
        
        {/* マップページ（ゲームプレイ画面） */}
        <Route path="/map/:マップID" element={<MapPage />} />
        
        {/* デフォルトマップへのリダイレクト */}
        <Route 
          path="/game" 
          element={
            <Navigate 
              to={`/map/${encodeURIComponent(デフォルト開始マップID)}?x=10&y=7`} 
              replace 
            />
          } 
        />
        
        {/* 404ページ（存在しないURLの場合） */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404 - ページが見つかりません</h1>
                <p className="text-slate-300 mb-8">お探しのページは存在しません。</p>
                <a 
                  href="/" 
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  ホームに戻る
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;