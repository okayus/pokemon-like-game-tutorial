/// <reference types="vite/client" />

// 初学者向け：Vite環境変数の型定義
// ViteのTypeScript統合のための型宣言

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
